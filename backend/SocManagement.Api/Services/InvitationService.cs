using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

namespace SocManagement.Api.Services;

public class InvitationService : IInvitationService
{
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromHours(24);

    private readonly SocDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IConfiguration _configuration;
    private readonly ILogger<InvitationService> _logger;

    public InvitationService(
        SocDbContext context,
        IEmailService emailService,
        IPasswordHasher<User> passwordHasher,
        IConfiguration configuration,
        ILogger<InvitationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<UserInvitation> InviteUserAsync(
        string name,
        string email,
        UserRole role,
        TimeSpan? expiration = null)
    {
        name = name.Trim();
        email = email.Trim();

        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Name and email are required.");
        }

        if (!Enum.IsDefined(role))
        {
            throw new ArgumentException("Invalid user role.", nameof(role));
        }

        var lifetime = expiration ?? DefaultExpiration;

        if (lifetime <= TimeSpan.Zero)
        {
            throw new ArgumentOutOfRangeException(
                nameof(expiration),
                "Expiration must be positive."
            );
        }

        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            throw new UserAlreadyExistsException();
        }

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"]?.TrimEnd('/');

        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
        {
            throw new InvalidOperationException(
                "Frontend:BaseUrl is not configured."
            );
        }

        // Generate a secure random invitation token.
        var token = Convert.ToHexString(
            RandomNumberGenerator.GetBytes(32)
        );

        var now = DateTime.UtcNow;

        // Create the invited user.
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = name,
            Email = email,
            Role = role,
            Status = UserStatus.Invited,
            MfaEnabled = true,
            PasswordHash = string.Empty
        };

        // Store only the token hash in the database.
        var invitation = new UserInvitation
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            User = user,
            TokenHash = HashToken(token),
            CreatedAt = now,
            ExpiresAt = now.Add(lifetime)
        };

        _context.Users.Add(user);
        _context.UserInvitations.Add(invitation);

        await _context.SaveChangesAsync();

        // Generate the invitation link.
        var invitationUrl =
            $"{frontendBaseUrl}/invite/accept?token={Uri.EscapeDataString(token)}";

        // Send the invitation email using Resend. If that fails, remove the user
        // again: otherwise an "Invited" user without a usable invitation stays
        // behind and every new attempt fails with "user already exists".
        try
        {
            await _emailService.SendInvitationEmailAsync(
                email,
                name,
                invitationUrl
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Sending the invitation email failed; rolling back the invited user.");

            _context.Users.Remove(user); // cascades to the invitation
            await _context.SaveChangesAsync();

            throw new EmailDeliveryException(ex);
        }

        return invitation;
    }

    public async Task<UserInvitation?> ValidateInvitationAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return null;
        }

        var tokenHash = HashToken(token);
        var now = DateTime.UtcNow;

        return await _context.UserInvitations
            .AsNoTracking()
            .Include(i => i.User)
            .FirstOrDefaultAsync(i =>
                i.TokenHash == tokenHash &&
                i.AcceptedAt == null &&
                i.ExpiresAt > now &&
                i.User.Status == UserStatus.Invited
            );
    }

    public async Task AcceptInvitationAsync(AcceptInvitationDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Token))
        {
            throw new ArgumentException(
                "An invitation token is required.",
                nameof(request)
            );
        }

        if (string.IsNullOrWhiteSpace(request.Password) ||
            request.Password.Length < 12)
        {
            throw new ArgumentException(
                "Password must be at least 12 characters long.",
                nameof(request)
            );
        }

        var tokenHash = HashToken(request.Token);

        // EnableRetryOnFailure (Program.cs) does not allow a manually started
        // transaction on its own: the whole unit of work has to run inside the
        // execution strategy so it can be retried as one piece.
        var strategy = _context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            // A retry starts from a clean slate.
            _context.ChangeTracker.Clear();

            var now = DateTime.UtcNow;

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            // Find the invitation and its associated user.
            var invitation = await _context.UserInvitations
                .Include(i => i.User)
                .FirstOrDefaultAsync(i => i.TokenHash == tokenHash);

            // Validate the invitation again before accepting it.
            if (invitation == null ||
                invitation.AcceptedAt != null ||
                invitation.ExpiresAt <= now ||
                invitation.User.Status != UserStatus.Invited)
            {
                throw new InvitationInvalidException();
            }

            // Atomically claim the invitation token.
            // Only one concurrent request can successfully claim it.
            var claimed = await _context.UserInvitations
                .Where(i =>
                    i.Id == invitation.Id &&
                    i.AcceptedAt == null &&
                    i.ExpiresAt > now
                )
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(i => i.AcceptedAt, now)
                );

            if (claimed != 1)
            {
                throw new InvitationInvalidException();
            }

            // Hash the password chosen by the user.
            invitation.User.PasswordHash =
                _passwordHasher.HashPassword(
                    invitation.User,
                    request.Password
                );

            // Activate the account.
            invitation.User.Status = UserStatus.Active;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        });
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)
            )
        );
    }
}
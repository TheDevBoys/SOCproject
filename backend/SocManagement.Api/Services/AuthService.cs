using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;
using Microsoft.AspNetCore.DataProtection;

namespace SocManagement.Api.Services;

public class AuthService : IAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private readonly SocDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IMfaService _mfaService;
    private readonly IDataProtector _protector;

    public AuthService(
        SocDbContext context,
        IPasswordHasher<User> passwordHasher,
        IMfaService mfaService,
        IDataProtectionProvider dataProtectionProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _mfaService = mfaService;

        _protector = dataProtectionProvider.CreateProtector(
            "SocManagement.MfaSecrets.v1"
        );
    }

    public async Task<LoginResult> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.Status != UserStatus.Active || IsLocked(user))
        {
            return Failed();
        }

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
        {
            await RegisterFailedAttemptAsync(user);
            return Failed();
        }

        user.FailedLoginAttempts = 0;
        user.LockedUntil = null;

        if (user.MfaEnabled)
        {
            await _context.SaveChangesAsync();

            return new LoginResult(new LoginResponseDto
            {
                Success = true,
                RequiresMfa = true,
                Message = "MFA verification required"
            }, user);
        }

        user.LastSignIn = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new LoginResult(new LoginResponseDto
        {
            Success = true,
            RequiresMfa = false,
            Message = "Login successful"
        }, user);
    }

    public async Task<MfaSetupResponseDto?> GetMfaSetupAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return null;
        }
        if (user.Status != UserStatus.Active || IsLocked(user))
        {
            return null;
        }

        if (user.MfaConfirmed)
        {
            return new MfaSetupResponseDto { SetupRequired = false };
        }

        var decryptedSecret = await ReadMfaSecretAsync(user);

        if (decryptedSecret == null)
        {
            decryptedSecret = _mfaService.GenerateSecret();
            user.MfaSecret = _protector.Protect(decryptedSecret);

            await _context.SaveChangesAsync();
        }

        return new MfaSetupResponseDto
        {
            SetupRequired = true,
            Secret = decryptedSecret,
            QrCodeUri = _mfaService.GenerateQrCodeUri(
                user.Email,
                decryptedSecret
            )
        };
    }

    public async Task<User?> VerifyMfaAsync(Guid userId, string code)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null ||
            user.Status != UserStatus.Active ||
            IsLocked(user) ||
            string.IsNullOrEmpty(user.MfaSecret))
        {
            return null;
        }

        var decryptedSecret = await ReadMfaSecretAsync(user);

        if (decryptedSecret == null)
        {
            return null;
        }

        if (!_mfaService.VerifyCode(decryptedSecret, code))
        {
            await RegisterFailedAttemptAsync(user);
            return null;
        }

        user.MfaConfirmed = true;
        user.FailedLoginAttempts = 0;
        user.LockedUntil = null;
        user.LastSignIn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<User?> GetUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);

        return user is { Status: UserStatus.Active } ? user : null;
    }

    private async Task<string?> ReadMfaSecretAsync(User user)
    {
        if (string.IsNullOrEmpty(user.MfaSecret))
        {
            return null;
        }

        try
        {
            return _protector.Unprotect(user.MfaSecret);
        }
        catch (CryptographicException)
        {
            if (!IsPlainBase32Secret(user.MfaSecret))
            {
                return null;
            }

            var legacySecret = user.MfaSecret;
            user.MfaSecret = _protector.Protect(legacySecret);
            await _context.SaveChangesAsync();

            return legacySecret;
        }
    }

    private static bool IsPlainBase32Secret(string value) =>
        value.Length <= 64 &&
        value.All(c => c is >= 'A' and <= 'Z' or >= '2' and <= '7' or '=');

    private static bool IsLocked(User user) =>
        user.LockedUntil.HasValue && user.LockedUntil.Value > DateTime.UtcNow;

    private async Task RegisterFailedAttemptAsync(User user)
    {
        user.FailedLoginAttempts++;

        if (user.FailedLoginAttempts >= MaxFailedAttempts)
        {
            user.LockedUntil = DateTime.UtcNow.Add(LockoutDuration);
        }

        await _context.SaveChangesAsync();
    }

    private static LoginResult Failed() => new(new LoginResponseDto
    {
        Success = false,
        RequiresMfa = false,
        Message = "Invalid email or password"
    }, null);
}

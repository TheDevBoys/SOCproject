using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

namespace SocManagement.Api.Services;

public class UserService : IUserService
{
    private readonly SocDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(SocDbContext context, IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderBy(u => u.Name)
            .ToListAsync();

        return users.Select(ToDto).ToList();
    }

    public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        return user == null ? null : ToDto(user);
    }

    public async Task<UserDto?> CreateAsync(CreateUserDto request)
    {
        var email = request.Email.Trim();

        if (await EmailInUseAsync(email))
        {
            return null;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = email,
            Role = request.Role,
            MfaEnabled = true,
            Status = UserStatus.Active
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return ToDto(user);
    }

    public async Task<UserUpdateResult> UpdateAsync(Guid id, UpdateUserDto request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return UserUpdateResult.NotFound;
        }

        var email = request.Email.Trim();

        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase) &&
            await EmailInUseAsync(email))
        {
            return UserUpdateResult.EmailTaken;
        }

        user.Email = email;
        if (request.Name is not null)
        {
            user.Name = request.Name.Trim();
        }

        await _context.SaveChangesAsync();

        return UserUpdateResult.Updated;
    }

    public Task<UserDeleteResult> DeleteAsync(Guid id) =>
        _context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            _context.ChangeTracker.Clear();
            await using var transaction =
                await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            var user = await _context.Users.SingleOrDefaultAsync(user => user.Id == id);
            if (user is null)
            {
                return UserDeleteResult.NotFound;
            }

            if (user.Role == nameof(UserRole.Superuser))
            {
                return UserDeleteResult.Protected;
            }

            if (await _context.Tickets.AnyAsync(ticket => ticket.AssignedUserId == id) ||
                await _context.Communications.AnyAsync(message => message.UserId == id) ||
                await _context.TicketHistories.AnyAsync(history => history.UserId == id))
            {
                return UserDeleteResult.HasTicketRecords;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync(acceptAllChangesOnSuccess: false);
            await transaction.CommitAsync();
            _context.ChangeTracker.AcceptAllChanges();
            return UserDeleteResult.Deleted;
        });

    private Task<bool> EmailInUseAsync(string email) =>
        _context.Users.AnyAsync(u => u.Email == email);

    private static UserDto ToDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        CustomerAccess = user.CustomerAccess,
        TwoFactor = user.MfaEnabled,
        LastSignIn = user.LastSignIn,
        Status = user.Status
    };
}

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
            .Select(u => new
            {
                User = u,
                CustomerCount = u.TenantAccesses.Count
            })
            .ToListAsync();

        return users.Select(x => ToDto(x.User, x.CustomerCount)).ToList();
    }

        public async Task<UserDto?> GetByIdAsync(Guid id)
    {
        var result = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new
            {
                User = u,
                CustomerCount = u.TenantAccesses.Count
            })
            .FirstOrDefaultAsync();

        return result == null ? null : ToDto(result.User, result.CustomerCount);
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

        return ToDto(user, 0);
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

        if (request.Role.HasValue)
        {
            user.Role = request.Role.Value;
        }

        await _context.SaveChangesAsync();

        return UserUpdateResult.Updated;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return false;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return true;
    }

    private Task<bool> EmailInUseAsync(string email) =>
        _context.Users.AnyAsync(u => u.Email == email);

        private static UserDto ToDto(User user, int customerCount) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        CustomerAccess = customerCount == 1 ? "1 customer" : $"{customerCount} customers",
        TwoFactor = user.MfaEnabled,
        LastSignIn = user.LastSignIn,
        Status = user.Status
    };
}

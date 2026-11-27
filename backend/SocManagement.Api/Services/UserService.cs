using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Auth;
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
            .Include(user => user.AccessRole)
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
            .Include(user => user.AccessRole)
            .Where(u => u.Id == id)
            .Select(u => new
            {
                User = u,
                CustomerCount = u.TenantAccesses.Count
            })
            .FirstOrDefaultAsync();

        return result == null ? null : ToDto(result.User, result.CustomerCount);
    }

    public async Task<(UserSaveResult Result, UserDto? User)> CreateAsync(CreateUserDto request)
    {
        var email = request.Email.Trim();

        if (await EmailInUseAsync(email))
        {
            return (UserSaveResult.EmailTaken, null);
        }

        if (!await IsValidCustomerLinkAsync(request.Role, request.CustomerId))
        {
            return (UserSaveResult.InvalidCustomerLink, null);
        }

        var role = await _context.Roles.SingleAsync(role => role.Key == request.Role);
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = email,
            AccessRole = role,
            CustomerId = request.CustomerId,
            MfaEnabled = true,
            Status = UserStatus.Active
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (UserSaveResult.Saved, ToDto(user, 0));
    }

    public async Task<UserSaveResult> UpdateAsync(Guid id, UpdateUserDto request)
    {
        var user = await _context.Users.Include(user => user.AccessRole).SingleOrDefaultAsync(user => user.Id == id);

        if (user == null)
        {
            return UserSaveResult.NotFound;
        }

        var email = request.Email.Trim();

        if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase) &&
            await EmailInUseAsync(email))
        {
            return UserSaveResult.EmailTaken;
        }

        var newRole = request.Role ?? user.AccessRole.Key;

        // Klantgebruiker houdt zijn klant als er geen nieuwe wordt meegestuurd;
        // bij een medewerkersrol wordt CustomerId leeg (tenzij er foutief een is meegestuurd).
        var newCustomerId = newRole == nameof(UserRole.Customer)
            ? request.CustomerId ?? user.CustomerId
            : request.CustomerId;

        if (!await IsValidCustomerLinkAsync(newRole, newCustomerId))
        {
            return UserSaveResult.InvalidCustomerLink;
        }

        // RRM: klantgebruikers krijgen geen KlantToegang.
        if (newRole == nameof(UserRole.Customer) &&
            await _context.TenantAccesses.AnyAsync(t => t.UserId == id))
        {
            return UserSaveResult.HasTenantAccess;
        }

        user.Email = email;
        if (newRole != user.AccessRole.Key)
        {
            user.AccessRole = await _context.Roles.SingleAsync(role => role.Key == newRole);
        }
        user.CustomerId = newCustomerId;
        if (request.Name is not null)
        {
            user.Name = request.Name.Trim();
        }

        await _context.SaveChangesAsync();

        return UserSaveResult.Saved;
    }

    public Task<UserDeleteResult> DeleteAsync(Guid id) =>
        _context.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            _context.ChangeTracker.Clear();
            await using var transaction =
                await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            var user = await _context.Users.Include(user => user.AccessRole).SingleOrDefaultAsync(user => user.Id == id);
            if (user is null)
            {
                return UserDeleteResult.NotFound;
            }

            if (Permissions.IsSuperuser(user.AccessRole))
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

    public async Task<UserStatusResult> SetStatusAsync(Guid id, UserStatus status)
    {
        var user = await _context.Users.Include(user => user.AccessRole).SingleOrDefaultAsync(user => user.Id == id);
        if (user is null)
        {
            return UserStatusResult.NotFound;
        }

        if (status == UserStatus.Inactive && Permissions.IsSuperuser(user.AccessRole))
        {
            return UserStatusResult.Protected;
        }

        if (user.Status == UserStatus.Invited)
        {
            return UserStatusResult.NotActivated;
        }

        user.Status = status;
        await _context.SaveChangesAsync();
        return UserStatusResult.Saved;
    }

    private Task<bool> EmailInUseAsync(string email) =>
        _context.Users.AnyAsync(u => u.Email == email);

    // Rol Customer => moet bij een bestaande klant horen; andere rollen => geen klant.
    private async Task<bool> IsValidCustomerLinkAsync(string role, int? customerId)
    {
        if (role == nameof(UserRole.Customer))
        {
            return customerId.HasValue &&
                   await _context.Customers.AnyAsync(c => c.Id == customerId.Value);
        }

        return customerId == null;
    }

        private static UserDto ToDto(User user, int customerCount) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.AccessRole.Key,
        RoleId = user.RoleId,
        RoleName = user.AccessRole.Name,
        CustomerAccess = customerCount == 1 ? "1 customer" : $"{customerCount} customers",
        CustomerId = user.CustomerId,
        TwoFactor = user.MfaEnabled,
        LastSignIn = user.LastSignIn,
        Status = user.Status
    };
}

using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;

namespace SocManagement.Api.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();

    Task<UserDto?> GetByIdAsync(Guid id);

    Task<(UserSaveResult Result, UserDto? User)> CreateAsync(CreateUserDto request);

    Task<UserSaveResult> UpdateAsync(Guid id, UpdateUserDto request);

    Task<UserDeleteResult> DeleteAsync(Guid id);

    Task<UserStatusResult> SetStatusAsync(Guid id, UserStatus status);
}

public enum UserStatusResult
{
    Saved,
    NotFound,
    Protected,
    NotActivated
}

public enum UserSaveResult
{
    Saved,
    NotFound,
    EmailTaken,
    InvalidCustomerLink,
    HasTenantAccess
}

public enum UserDeleteResult
{
    Deleted,
    NotFound,
    Protected,
    HasTicketRecords
}

using SocManagement.Api.DTOs;

namespace SocManagement.Api.Services;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync();

    Task<UserDto?> GetByIdAsync(Guid id);

    Task<UserDto?> CreateAsync(CreateUserDto request);

    Task<UserUpdateResult> UpdateAsync(Guid id, UpdateUserDto request);

    Task<UserDeleteResult> DeleteAsync(Guid id);
}

public enum UserUpdateResult
{
    Updated,
    NotFound,
    EmailTaken
}

public enum UserDeleteResult
{
    Deleted,
    NotFound,
    Protected,
    HasTicketRecords
}

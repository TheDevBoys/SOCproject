using SocManagement.Api.DTOs;

namespace SocManagement.Api.Services;

public interface IUserService
{
    List<UserDto> GetAll();
}

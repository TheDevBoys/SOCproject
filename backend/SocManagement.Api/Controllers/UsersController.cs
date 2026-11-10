using Microsoft.AspNetCore.Mvc;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;

namespace SocManagement.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    [HttpGet]
    public ActionResult<List<UserDto>> GetUsers()
    {
        var users = new List<UserDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Joost",
                Email = "joost@example.com",
                Role = UserRole.Tier1
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Tim",
                Email = "tim@example.com",
                Role = UserRole.Superuser
            }
        };

        return Ok(users);
    }
}
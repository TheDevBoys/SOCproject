using Microsoft.AspNetCore.Mvc;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;
using SocManagement.Api.Services;

namespace SocManagement.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public ActionResult<List<UserDto>> GetUsers()
    {
        return Ok(_userService.GetAll());
    }
}
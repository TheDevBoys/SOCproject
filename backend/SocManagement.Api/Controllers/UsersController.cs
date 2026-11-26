using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SocManagement.Api.DTOs;
using SocManagement.Api.Services;
using SocManagement.Api.Enums;

namespace SocManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }


    [HttpGet]
    [Authorize(Roles = nameof(UserRole.Superuser))]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        return Ok(await _userService.GetAllAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        if (!User.IsInRole(nameof(UserRole.Superuser)) && CurrentUserId() != id)
        {
            return Forbid();
        }

        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }


    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Superuser))]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserDto request)
    {
        var (result, user) = await _userService.CreateAsync(request);

        if (result == UserSaveResult.EmailTaken)
        {
            return Conflict(new
            {
                message = "A user with this email address already exists."
            });
        }

        if (result == UserSaveResult.InvalidCustomerLink)
        {
            return BadRequest(new
            {
                message = "Role Customer requires an existing customerId; other roles cannot have a customerId."
            });
        }

        return CreatedAtAction(
            nameof(GetUser),
            new { id = user!.Id },
            user
        );
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Superuser))]
    public async Task<IActionResult> UpdateUser(
        Guid id,
        [FromBody] UpdateUserDto request)
    {
        var result = await _userService.UpdateAsync(id, request);

        return result switch
        {
            UserSaveResult.NotFound => NotFound(new
            {
                message = "User not found."
            }),
            UserSaveResult.EmailTaken => Conflict(new
            {
                message = "A user with this email address already exists."
            }),
            UserSaveResult.InvalidCustomerLink => BadRequest(new
            {
                message = "Role Customer requires an existing customerId; other roles cannot have a customerId."
            }),
            UserSaveResult.HasCustomerAccess => Conflict(new
            {
                message = "Remove this user's customer access before changing the role to Customer."
            }),
            _ => Ok(new
            {
                message = "User updated successfully."
            })
        };
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Superuser))]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        if (CurrentUserId() == id)
        {
            return BadRequest(new
            {
                message = "You cannot delete your own account."
            });
        }

        var deleted = await _userService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return NoContent();
    }

    private Guid? CurrentUserId() =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}

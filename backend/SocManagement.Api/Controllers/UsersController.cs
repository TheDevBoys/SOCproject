using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.Enums;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SocManagement.Api.DTOs;
using SocManagement.Api.Services;
using SocManagement.Api.Auth;

namespace SocManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly SocDbContext _context;

    public UsersController(IUserService userService, SocDbContext context)
    {
        _userService = userService;
        _context = context;
    }


    [HttpGet]
    [Authorize(Policy = Permissions.UserRead)]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        return Ok(await _userService.GetAllAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        if (!User.HasClaim(Permissions.ClaimType, Permissions.UserRead) && CurrentUserId() != id)
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
    [Authorize(Policy = Permissions.UserCreate)]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserDto request)
    {
        var role = await _context.Roles.Include(role => role.Permissions)
            .SingleOrDefaultAsync(role => role.Name == request.Role);
        if (role is null)
        {
            return BadRequest(new { message = "Select an existing role." });
        }

        if (!Permissions.CanAssignRole(User, role))
        {
            return Forbid();
        }

        request.Role = role.Name;
        var user = await _userService.CreateAsync(request);

        if (user == null)
        {
            return Conflict(new
            {
                message = "A user with this email address already exists."
            });
        }

        return CreatedAtAction(
            nameof(GetUser),
            new { id = user.Id },
            user
        );
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.UserUpdate)]
    public async Task<IActionResult> UpdateUser(
        Guid id,
        [FromBody] UpdateUserDto request)
    {
        if (!User.HasClaim(Permissions.ClaimType, Permissions.RoleManage) &&
            await IsSuperuserAsync(id))
        {
            return Forbid();
        }

        if (request.Name is not null && string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Name cannot be blank." });
        }

        var result = await _userService.UpdateAsync(id, request);

        return result switch
        {
            UserUpdateResult.NotFound => NotFound(new
            {
                message = "User not found."
            }),
            UserUpdateResult.EmailTaken => Conflict(new
            {
                message = "A user with this email address already exists."
            }),
            _ => Ok(new
            {
                message = "User updated successfully."
            })
        };
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.UserDelete)]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        if (CurrentUserId() == id)
        {
            return BadRequest(new
            {
                message = "You cannot delete your own account."
            });
        }

        return await _userService.DeleteAsync(id) switch
        {
            UserDeleteResult.Protected => Forbid(),
            UserDeleteResult.NotFound => NotFound(new { message = "User not found." }),
            UserDeleteResult.HasTicketRecords => Conflict(new
            {
                message = "This user has assigned tickets or ticket history and cannot be deleted."
            }),
            _ => NoContent()
        };
    }

    private Task<bool> IsSuperuserAsync(Guid id) =>
        _context.Users.AnyAsync(user => user.Id == id && user.Role == nameof(UserRole.Superuser));

    private Guid? CurrentUserId() =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}

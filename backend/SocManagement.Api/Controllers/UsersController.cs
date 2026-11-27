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
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, SocDbContext context, ILogger<UsersController> logger)
    {
        _userService = userService;
        _context = context;
        _logger = logger;
    }


    [HttpGet]
    [Authorize(Policy = Permissions.Users.Read)]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        return Ok(await _userService.GetAllAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        if (!User.HasClaim(Permissions.ClaimType, Permissions.Users.Read) && CurrentUserId() != id)
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
    [Authorize(Policy = Permissions.Users.Create)]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserDto request)
    {
        var role = await _context.Roles.Include(role => role.Permissions)
            .SingleOrDefaultAsync(role => role.Key == request.Role);
        if (role is null)
        {
            return BadRequest(new { message = "Select an existing role." });
        }

        if (!Permissions.CanAssignRole(User, role))
        {
            return Forbid();
        }

        request.Role = role.Key;
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
    [Authorize(Policy = Permissions.Users.Update)]
    public async Task<IActionResult> UpdateUser(
        Guid id,
        [FromBody] UpdateUserDto request)
    {
        if (!Permissions.IsSuperuser(User) &&
            await IsSuperuserAsync(id))
        {
            return Forbid();
        }

        if (request.Role is not null || request.CustomerId is not null)
        {
            if (!Permissions.IsSuperuser(User))
            {
                return Forbid();
            }

            if (request.Role is not null)
            {
                var role = await _context.Roles.SingleOrDefaultAsync(role => role.Key == request.Role);
                if (role is null)
                {
                    return BadRequest(new { message = "Select an existing role." });
                }

                if (await IsSuperuserAsync(id) && !Permissions.IsSuperuser(role))
                {
                    return Forbid();
                }

                request.Role = role.Key;
            }
        }

        if (request.Name is not null && string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Name cannot be blank." });
        }

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
            UserSaveResult.HasTenantAccess => Conflict(new
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
    [Authorize(Policy = Permissions.Users.Delete)]
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

    [HttpPut("{id:guid}/status")]
    [Authorize(Policy = Permissions.Users.Update)]
    public async Task<IActionResult> SetUserStatus(Guid id, [FromBody] UpdateUserStatusDto request)
    {
        if (request.Status is not (UserStatus.Active or UserStatus.Inactive))
        {
            return BadRequest(new { message = "Status must be Active or Inactive." });
        }

        if (CurrentUserId() == id)
        {
            return BadRequest(new { message = "You cannot change the status of your own account." });
        }

        if (!Permissions.IsSuperuser(User) && await IsSuperuserAsync(id))
        {
            return Forbid();
        }

        var result = await _userService.SetStatusAsync(id, request.Status.Value);
        if (result == UserStatusResult.Saved)
        {
            _logger.LogInformation("User {ActorId} set the status of user {TargetId} to {Status}",
                CurrentUserId(), id, request.Status.Value);
        }

        return result switch
        {
            UserStatusResult.Protected => Forbid(),
            UserStatusResult.NotFound => NotFound(new { message = "User not found." }),
            UserStatusResult.NotActivated => Conflict(new
            {
                message = "This user has not accepted the invitation yet. Delete the user instead."
            }),
            _ => NoContent()
        };
    }

    private Task<bool> IsSuperuserAsync(Guid id) =>
        _context.Users.AnyAsync(user => user.Id == id && user.AccessRole.Key == Permissions.SuperuserRole);

    private Guid? CurrentUserId() =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}

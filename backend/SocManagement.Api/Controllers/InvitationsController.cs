using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.Auth;
using Microsoft.AspNetCore.Mvc;
using SocManagement.Api.DTOs;
using SocManagement.Api.Services;

namespace SocManagement.Api.Controllers;

[ApiController]
[Route("api/invitations")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;
    private readonly SocDbContext _context;

    public InvitationsController(IInvitationService invitationService, SocDbContext context)
    {
        _invitationService = invitationService;
        _context = context;
    }

    // POST: api/invitations
    [HttpPost]
    [Authorize(Policy = Permissions.UserInvite)]
    public async Task<IActionResult> InviteUser(
        [FromBody] CreateInvitedUserDto request)
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

        try
        {
            var invitation = await _invitationService.InviteUserAsync(
                request.Name,
                request.Email,
                role.Name,
                request.CustomerId
            );

            return StatusCode(StatusCodes.Status201Created, new
            {
                message = "Invitation created and email sent.",
                invitationId = invitation.Id,
                expiresAt = invitation.ExpiresAt
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UserAlreadyExistsException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
        catch (EmailDeliveryException ex)
        {
            // The mail provider failed; the service already removed the user again.
            return StatusCode(StatusCodes.Status502BadGateway, new
            {
                message = ex.Message
            });
        }
    }

    // GET: api/invitations/validate?token=...
    [HttpGet("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateInvitation(
        [FromQuery] string? token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new
            {
                message = "An invitation token is required."
            });
        }

        var invitation = await _invitationService.ValidateInvitationAsync(token);

        if (invitation == null)
        {
            return BadRequest(new
            {
                message = "The invitation is invalid, expired or already used."
            });
        }

        return Ok(new
        {
            valid = true,
            name = invitation.User.Name,
            email = invitation.User.Email,
            expiresAt = invitation.ExpiresAt
        });
    }

    // POST: api/invitations/accept
    [HttpPost("accept")]
    [AllowAnonymous]
    public async Task<IActionResult> AcceptInvitation(
        [FromBody] AcceptInvitationDto request)
    {
        try
        {
            await _invitationService.AcceptInvitationAsync(request);

            return Ok(new
            {
                message = "Account activated successfully. You can now sign in."
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvitationInvalidException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}
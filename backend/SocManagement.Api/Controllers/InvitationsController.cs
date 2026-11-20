using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;
using SocManagement.Api.Services;

namespace SocManagement.Api.Controllers;

[ApiController]
[Route("api/invitations")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;

    public InvitationsController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }

    // POST: api/invitations
    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Superuser))]
    public async Task<IActionResult> InviteUser(
        [FromBody] CreateInvitedUserDto request)
    {
        if (!request.Role.HasValue ||
            !Enum.IsDefined(request.Role.Value))
        {
            return BadRequest(new
            {
                message = "A valid role is required."
            });
        }

        try
        {
            var invitation = await _invitationService.InviteUserAsync(
                request.Name,
                request.Email,
                request.Role.Value
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
        catch (InvalidOperationException ex)
            when (ex.Message == "A user with this email already exists.")
        {
            return Conflict(new
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
        catch (InvalidOperationException ex)
            when (
                ex.Message == "The invitation is invalid, expired or already used." ||
                ex.Message == "The invitation has already been used or has expired."
            )
        {
            return BadRequest(new
            {
                message = "The invitation is invalid, expired or already used."
            });
        }
    }
}
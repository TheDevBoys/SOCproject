using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocManagement.Api.Auth;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;
using SocManagement.Api.Services;

namespace SocManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var (response, user) = await _authService.LoginAsync(request);

        if (!response.Success || user == null)
        {
            return Unauthorized(response);
        }

        if (response.RequiresMfa)
        {
            var pending = new ClaimsPrincipal(new ClaimsIdentity(
                [new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())],
                AuthSchemes.MfaPending));

            await HttpContext.SignInAsync(AuthSchemes.MfaPending, pending);
        }
        else
        {
            await SignInSessionAsync(user);
        }

        return Ok(response);
    }

    [HttpGet("mfa/setup")]
    [Authorize(AuthenticationSchemes = AuthSchemes.MfaPending)]
    public async Task<ActionResult<MfaSetupResponseDto>> GetMfaSetup()
    {
        var setup = await _authService.GetMfaSetupAsync(CurrentUserId());

        return setup == null ? Unauthorized() : Ok(setup);
    }

    [HttpPost("mfa/verify")]
    [Authorize(AuthenticationSchemes = AuthSchemes.MfaPending)]
    public async Task<IActionResult> VerifyMfa([FromBody] VerifyMfaDto request)
    {
        var user = await _authService.VerifyMfaAsync(CurrentUserId(), request.Code);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid or expired code" });
        }

        await HttpContext.SignOutAsync(AuthSchemes.MfaPending);
        await SignInSessionAsync(user);

        return Ok(new { success = true });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserDto>> Me()
    {
        var user = await _authService.GetUserAsync(CurrentUserId());

        if (user == null)
        {
            await HttpContext.SignOutAsync(AuthSchemes.Session);
            return Unauthorized();
        }

        return Ok(new CurrentUserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Permissions = Permissions.ForUser(user),
            MfaEnabled = user.MfaEnabled
        });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(AuthSchemes.Session);
        await HttpContext.SignOutAsync(AuthSchemes.MfaPending);

        return NoContent();
    }

    private Task SignInSessionAsync(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email)
        };

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, AuthSchemes.Session));

        return HttpContext.SignInAsync(AuthSchemes.Session, principal);
    }

    private Guid CurrentUserId() =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;
}

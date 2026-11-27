using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocManagement.Api.DTOs;
using SocManagement.Api.Auth;
using SocManagement.Api.Services;

namespace SocManagement.Api.Controllers;

// Klanttoegang (KlantToegang / TenantAccess) per gebruiker beheren. Alleen Superusers.
[ApiController]
[Authorize(Policy = Permissions.Roles.Manage)]
[Route("api/users/{userId:guid}/customers")]
public class UserCustomersController : ControllerBase
{
    private readonly ITenantService _tenantService;

    public UserCustomersController(ITenantService tenantService)
    {
        _tenantService = tenantService;
    }

    // GET api/users/{userId}/customers
    [HttpGet]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers(Guid userId)
    {
        var customers = await _tenantService.GetCustomersForUserAsync(userId);

        if (customers == null)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(customers);
    }

    // POST api/users/{userId}/customers   body: { "customerId": 1 }
    [HttpPost]
    public async Task<IActionResult> GrantAccess(Guid userId, [FromBody] GrantCustomerAccessDto request)
    {
        var result = await _tenantService.GrantAsync(userId, request.CustomerId);

        return result switch
        {
            TenantAccessResult.UserNotFound => NotFound(new { message = "User not found." }),
            TenantAccessResult.CustomerNotFound => NotFound(new { message = "Customer not found." }),
            TenantAccessResult.NotAnEmployee => BadRequest(new { message = "Customer users cannot be given customer access." }),
            TenantAccessResult.AlreadyGranted => Conflict(new { message = "This user already has access to this customer." }),
            _ => CreatedAtAction(nameof(GetCustomers), new { userId }, null)
        };
    }

    // DELETE api/users/{userId}/customers/{customerId}
    [HttpDelete("{customerId:int}")]
    public async Task<IActionResult> RevokeAccess(Guid userId, int customerId)
    {
        if (!await _tenantService.RevokeAsync(userId, customerId))
        {
            return NotFound(new { message = "Access not found." });
        }

        return NoContent();
    }
}
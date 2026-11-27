using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Auth;
using SocManagement.Api.Data;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

namespace SocManagement.Api.Controllers;

[ApiController]
[Authorize(Policy = Permissions.RoleManage)]
[Route("api/roles")]
public class RolesController(SocDbContext context, ILogger<RolesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await context.Roles.AsNoTracking().Include(role => role.Permissions)
            .OrderBy(role => role.Name).ToListAsync();

        return Ok(new
        {
            permissions = Permissions.All,
            roles = roles.Select(role => new
            {
                role.Id,
                name = role.Key,
                displayName = role.Name,
                permissions = role.Key == nameof(UserRole.Superuser)
                    ? Permissions.All.Prepend(Permissions.RoleManage).ToArray()
                    : role.Permissions.Select(permission => permission.Key).ToArray()
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateRole(CreateRoleRequest request)
    {
        var name = request.Name.Trim();
        if (await context.Roles.AnyAsync(role => role.Name == name))
        {
            return Conflict(new { message = "This role already exists." });
        }

        var permissions = await ResolvePermissionsAsync(request.Permissions);
        if (permissions is null)
        {
            return BadRequest(new { message = "Unknown permission." });
        }

        var key = $"custom_{Guid.NewGuid():N}"[..20];
        context.Roles.Add(new Role { Key = key, Name = name, Permissions = permissions });
        await context.SaveChangesAsync();
        logger.LogInformation("User {ActorId} created role {Role} with permissions {Permissions}",
            ActorId, name, Describe(permissions));
        return StatusCode(StatusCodes.Status201Created);
    }

    [HttpPut("permissions")]
    public async Task<IActionResult> SetRolePermissions(RoleRequest request)
    {
        var role = await context.Roles.Include(role => role.Permissions)
            .SingleOrDefaultAsync(role => role.Key == request.Name);
        if (role is null) return NotFound();
        if (role.Key == nameof(UserRole.Superuser)) return Forbid();

        if (request.DisplayName is not null)
        {
            if (string.IsNullOrWhiteSpace(request.DisplayName))
                return BadRequest(new { message = "Role name cannot be blank." });

            role.Name = request.DisplayName.Trim();
        }

        var permissions = await ResolvePermissionsAsync(request.Permissions);
        if (permissions is null) return BadRequest(new { message = "Unknown permission." });

        var previousPermissions = Describe(role.Permissions);
        role.Permissions = permissions;
        await context.SaveChangesAsync();
        logger.LogInformation("User {ActorId} changed permissions for role {Role} from {PreviousPermissions} to {Permissions}",
            ActorId, role.Key, previousPermissions, Describe(permissions));
        return NoContent();
    }

    [HttpGet("users/{id:guid}")]
    public async Task<IActionResult> GetUserAccess(Guid id)
    {
        var user = await context.Users.AsNoTracking().Include(user => user.DirectPermissions).Include(user => user.AccessRole)
            .SingleOrDefaultAsync(user => user.Id == id);
        return user is null ? NotFound() : Ok(new
        {
            name = user.AccessRole.Key,
            roleId = user.RoleId,
            user.CustomerId,
            permissions = user.DirectPermissions.Select(permission => permission.Key)
        });
    }

    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> SetUserAccess(Guid id, RoleRequest request)
    {
        var user = await context.Users.Include(user => user.DirectPermissions).Include(user => user.AccessRole)
            .SingleOrDefaultAsync(user => user.Id == id);
        if (user is null) return NotFound();

        var role = await context.Roles.SingleOrDefaultAsync(role => role.Key == request.Name);
        if (role is null) return BadRequest(new { message = "Select an existing role." });
        if (user.AccessRole.Key == nameof(UserRole.Superuser) || role.Key == nameof(UserRole.Superuser))
        {
            return Forbid();
        }

        var permissions = await ResolvePermissionsAsync(request.Permissions);
        if (permissions is null) return BadRequest(new { message = "Unknown permission." });

        var customerId = role.Key == nameof(UserRole.Customer)
            ? request.CustomerId ?? user.CustomerId
            : null;
        if (role.Key == nameof(UserRole.Customer) &&
            (!await context.Customers.AnyAsync(customer => customer.Id == customerId) ||
             await context.TenantAccesses.AnyAsync(access => access.UserId == id)))
        {
            return BadRequest(new { message = "Customer accounts need an existing customer and cannot have employee customer access." });
        }

        var previousRole = user.AccessRole.Key;
        var previousPermissions = Describe(user.DirectPermissions);
        user.AccessRole = role;
        user.CustomerId = customerId;
        user.DirectPermissions = permissions;
        await context.SaveChangesAsync();
        logger.LogInformation(
            "User {ActorId} changed access for user {TargetId} from {PreviousRole} ({PreviousPermissions}) to {Role} ({Permissions})",
            ActorId, id, previousRole, previousPermissions, role.Key, Describe(permissions));
        return NoContent();
    }

    private async Task<List<Permission>?> ResolvePermissionsAsync(string[] keys)
    {
        var uniqueKeys = keys.Distinct(StringComparer.Ordinal).ToArray();
        if (uniqueKeys.Any(key => !Permissions.All.Contains(key))) return null;

        var permissions = await context.Permissions.Where(permission => uniqueKeys.Contains(permission.Key))
            .ToListAsync();
        return permissions.Count == uniqueKeys.Length ? permissions : null;
    }

    private string? ActorId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static string Describe(IEnumerable<Permission> permissions) =>
        string.Join(", ", permissions.Select(permission => permission.Key).Order(StringComparer.Ordinal));

    public record CreateRoleRequest(
        [Required, StringLength(100)] string Name,
        [Required] string[] Permissions);

    public record RoleRequest(
        [Required, StringLength(20)] string Name,
        [Required] string[] Permissions,
        int? CustomerId,
        [StringLength(100, MinimumLength = 1)] string? DisplayName);
}

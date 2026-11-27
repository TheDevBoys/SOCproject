using System.Security.Claims;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

namespace SocManagement.Api.Auth;

public static class Permissions
{
    public const string ClaimType = "soc.permission";
    public const string RoleManage = "role.manage";
    public const string UserRead = "user.read";
    public const string UserCreate = "user.create";
    public const string UserUpdate = "user.update";
    public const string UserDelete = "user.delete";
    public const string UserInvite = "user.invite";
    public const string CustomerRead = "customer.read";
    public const string CustomerCreate = "customer.create";
    public const string TicketRead = "ticket.read";
    public const string TicketCreate = "ticket.create";

    public static IReadOnlyList<string> All { get; } =
        Array.AsReadOnly(new[]
        {
            UserRead, UserCreate, UserUpdate, UserDelete, UserInvite,
            CustomerRead, CustomerCreate, TicketRead, TicketCreate
        });

    public static bool CanAssignRole(ClaimsPrincipal actor, Role role) =>
        actor.HasClaim(ClaimType, RoleManage) ||
        (role.Key == nameof(UserRole.Tier1) &&
         role.Permissions.All(permission => actor.HasClaim(ClaimType, permission.Key)));

    public static IReadOnlyList<string> ForUser(User user) =>
        user.AccessRole.Key == nameof(UserRole.Superuser)
            ? All.Append(RoleManage).ToArray()
            : user.AccessRole.Permissions.Select(permission => permission.Key)
                .Union(user.DirectPermissions.Select(permission => permission.Key))
                .Intersect(All)
                .ToArray();
}

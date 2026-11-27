using System.Reflection;
using System.Security.Claims;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

namespace SocManagement.Api.Auth;

public static class Permissions
{
    public const string ClaimType = "soc.permission";
    public const string RoleClaimType = "soc.role";
    public const string SuperuserRole = nameof(UserRole.Superuser);

    public static class Roles
    {
        public const string Manage = "role.manage";
    }

    public static class Users
    {
        public const string Read = "user.read";
        public const string Create = "user.create";
        public const string Update = "user.update";
        public const string Delete = "user.delete";
        public const string Invite = "user.invite";
    }

    public static class Customers
    {
        public const string Read = "customer.read";
        public const string Create = "customer.create";
    }

    public static class Tickets
    {
        public const string Read = "ticket.read";
        public const string Create = "ticket.create";
    }

    public static IReadOnlyList<string> All { get; } = typeof(Permissions).GetNestedTypes()
        .SelectMany(group => group.GetFields(BindingFlags.Public | BindingFlags.Static))
        .Where(field => field.IsLiteral && field.FieldType == typeof(string))
        .Select(field => (string)field.GetRawConstantValue()!)
        .ToArray()
        .AsReadOnly();

    public static bool IsSuperuser(ClaimsPrincipal principal) =>
        principal.HasClaim(RoleClaimType, SuperuserRole);

    public static bool IsSuperuser(Role role) => role.Key == SuperuserRole;

    public static bool CanAssignRole(ClaimsPrincipal actor, Role role) =>
        IsSuperuser(actor) ||
        (role.Key == nameof(UserRole.Tier1) &&
         role.Permissions.All(permission => actor.HasClaim(ClaimType, permission.Key)));

    public static IReadOnlyList<string> ForRole(Role role) => Effective(role, []);

    public static IReadOnlyList<string> ForUser(User user) => Effective(user.AccessRole, user.DirectPermissions);

    private static IReadOnlyList<string> Effective(Role role, IEnumerable<Permission> directPermissions)
    {
        if (IsSuperuser(role))
        {
            return All;
        }

        var granted = role.Permissions.Concat(directPermissions)
            .Select(permission => permission.Key)
            .ToHashSet(StringComparer.Ordinal);
        return All.Where(key => key != Roles.Manage && granted.Contains(key)).ToArray();
    }
}

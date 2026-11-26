using SocManagement.Api.Enums;

namespace SocManagement.Api.Auth;

public static class Permissions
{
    public const string ClaimType = "soc.permission";
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

    public static IReadOnlyList<string> ForRole(UserRole role) =>
        role == UserRole.Superuser ? All : Array.Empty<string>();
}

using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;

namespace SocManagement.Api.Services;

public class UserService : IUserService
{
    private static readonly List<UserDto> Users =
    [
        new()
        {
            Id = Guid.NewGuid(),
            Name = "M. Jansen",
            Email = "m.jansen@soc.nl",
            Role = UserRole.Tier1,
            CustomerAccess = "14 customers",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 6, 8, 2, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "S. Bakker",
            Email = "s.bakker@soc.nl",
            Role = UserRole.Tier1,
            CustomerAccess = "14 customers",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 6, 7, 58, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "R. Visser",
            Email = "r.visser@soc.nl",
            Role = UserRole.Tier2,
            CustomerAccess = "22 customers",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 6, 8, 15, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "L. Smit",
            Email = "l.smit@soc.nl",
            Role = UserRole.Tier3,
            CustomerAccess = "31 customers",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 5, 17, 48, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "P. de Wit",
            Email = "p.dewit@soc.nl",
            Role = UserRole.Engineer,
            CustomerAccess = "On request",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 6, 9, 1, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "A. Mulder",
            Email = "a.mulder@soc.nl",
            Role = UserRole.AccountManager,
            CustomerAccess = "3 customers",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 5, 16, 12, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "K. Hendriks",
            Email = "k.hendriks@soc.nl",
            Role = UserRole.Superuser,
            CustomerAccess = "On request, logged",
            TwoFactor = true,
            LastSignIn = new DateTime(2026, 10, 6, 8, 30, 0),
            Status = UserStatus.Active
        },

        new()
        {
            Id = Guid.NewGuid(),
            Name = "N. Prins",
            Email = "n.prins@soc.nl",
            Role = UserRole.ForensicAnalyst,
            CustomerAccess = "2 customers",
            TwoFactor = false,
            LastSignIn = null,
            Status = UserStatus.Invited
        },
    ];

    public List<UserDto> GetAll()
    {
        return Users;
    }
}
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

namespace SocManagement.Api.Data;

// Vaste testdata voor de dev-database (HasData). Alle waarden moeten constant zijn:
// geen Guid.NewGuid() of DateTime.Now, anders ziet EF bij elke migratie "nieuwe" data.
public static class SeedUsers
{
    // Eén vaste hash voor alle testgebruikers (PasswordHasher, V3-formaat).
    // Het bijbehorende testwachtwoord staat NIET in Git.
    private const string TestPasswordHash =
        "AQAAAAIAAYagAAAAEMI61lHn1YCfav7Eeo0QX8LrYAJnScraLLCt5t44psyOYf1Vi2jrJfele0pjqcufgA==";

    public static User[] GetUsers() =>
    [
        new()
        {
            Id = new Guid("cff2ace7-00ab-487d-b2eb-d3681e89862f"),
            Name = "M. Jansen",
            Email = "m.jansen@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.Tier1,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 6, 8, 2, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "14 customers"
        },
        new()
        {
            Id = new Guid("d6596d4a-33dd-4b5c-8d8a-7a148ebbde8a"),
            Name = "S. Bakker",
            Email = "s.bakker@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.Tier1,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 6, 7, 58, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "14 customers"
        },
        new()
        {
            Id = new Guid("a4c85f52-e4b9-4759-86ac-08d43e2ced7d"),
            Name = "R. Visser",
            Email = "r.visser@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.Tier2,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 6, 8, 15, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "22 customers"
        },
        new()
        {
            Id = new Guid("4d7bc960-9820-4809-ab0e-eecc0619381d"),
            Name = "L. Smit",
            Email = "l.smit@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.Tier3,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 5, 17, 48, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "31 customers"
        },
        new()
        {
            Id = new Guid("f089b422-d95e-45c4-a65e-03e8c83dfca6"),
            Name = "P. de Wit",
            Email = "p.dewit@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.Engineer,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 6, 9, 1, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "On request"
        },
        new()
        {
            Id = new Guid("7d26ff69-db3e-4b3b-8e4f-7f1abb78ba05"),
            Name = "A. Mulder",
            Email = "a.mulder@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.AccountManager,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 5, 16, 12, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "3 customers"
        },
        new()
        {
            Id = new Guid("cd1f2a56-fbf4-48b0-ae43-c99c104dc025"),
            Name = "K. Hendriks",
            Email = "k.hendriks@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.Superuser,
            MfaEnabled = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = new DateTime(2026, 10, 6, 8, 30, 0, DateTimeKind.Utc),
            Status = UserStatus.Active,
            CustomerAccess = "On request, logged"
        },
        new()
        {
            Id = new Guid("41d1e697-839a-4b88-a502-41a09fdf36c3"),
            Name = "N. Prins",
            Email = "n.prins@soc.nl",
            PasswordHash = TestPasswordHash,
            Role = UserRole.ForensicAnalyst,
            MfaEnabled = false,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastSignIn = null,
            Status = UserStatus.Invited,
            CustomerAccess = "2 customers"
        }
    ];
}

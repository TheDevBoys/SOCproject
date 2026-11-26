using SocManagement.Api.Enums;

namespace SocManagement.Api.Models;

public class User
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool MfaEnabled { get; set; }

    public string? MfaSecret { get; set; }

    public bool MfaConfirmed { get; set; }

    public int FailedLoginAttempts { get; set; }

    public DateTime? LockedUntil { get; set; }

    public DateTime? LastSignIn { get; set; }

    public UserStatus Status { get; set; }

    public string CustomerAccess { get; set; } = string.Empty;

    // Klanten waartoe deze gebruiker toegang heeft (KlantToegang).
    public List<TenantAccess> TenantAccesses { get; set; } = new();

    // Alleen voor klantgebruikers (rol Customer): bij welke klant hoort dit account.
    // Medewerkers hebben hier null; hun toegang loopt via TenantAccesses.
    public int? CustomerId { get; set; }

    public Customer? Customer { get; set; }
}
using SocManagement.Api.Enums;

namespace SocManagement.Api.Models;

public class User
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = nameof(UserRole.Tier1);
    public Role AccessRole { get; set; } = null!;
    public ICollection<Permission> DirectPermissions { get; set; } = [];

    public bool MfaEnabled { get; set; }

    public string? MfaSecret { get; set; }

    public bool MfaConfirmed { get; set; }

    public int FailedLoginAttempts { get; set; }

    public DateTime? LockedUntil { get; set; }

    public DateTime? LastSignIn { get; set; }

    public UserStatus Status { get; set; }

    public string CustomerAccess { get; set; } = string.Empty;
}
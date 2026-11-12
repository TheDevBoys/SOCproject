using SocManagement.Api.Enums;

namespace SocManagement.Api.DTOs;

public class UserDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public string CustomerAccess { get; set; } = string.Empty;

    public bool TwoFactor { get; set; }

    public DateTime? LastSignIn { get; set; }

    public UserStatus Status { get; set; }
}
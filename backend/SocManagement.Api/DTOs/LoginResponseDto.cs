namespace SocManagement.Api.DTOs;

public class LoginResponseDto
{
    public bool Success { get; set; }

    public bool RequiresMfa { get; set; }

    public string Message { get; set; } = string.Empty;
}

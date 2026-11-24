using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class AcceptInvitationDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(12)]
    public string Password { get; set; } = string.Empty;
}
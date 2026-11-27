using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class CreateInvitedUserDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = string.Empty;

    public int? CustomerId { get; set; }
}
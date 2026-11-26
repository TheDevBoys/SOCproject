using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class UpdateUserDto
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

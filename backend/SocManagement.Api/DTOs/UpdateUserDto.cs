using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class UpdateUserDto
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Role { get; set; }

    // Verplicht bij rol Customer, leeg bij alle andere rollen.
    public int? CustomerId { get; set; }
}

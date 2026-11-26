using System.ComponentModel.DataAnnotations;
using SocManagement.Api.Enums;

namespace SocManagement.Api.DTOs;

public class UpdateUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(UserRole))]
    public UserRole? Role { get; set; }

    // Verplicht bij rol Customer, leeg bij alle andere rollen.
    public int? CustomerId { get; set; }
}
using System.ComponentModel.DataAnnotations;
using SocManagement.Api.Enums;

namespace SocManagement.Api.DTOs;

public class CreateUserDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(12)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; set; }
}
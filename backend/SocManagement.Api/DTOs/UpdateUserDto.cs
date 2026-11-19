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
}
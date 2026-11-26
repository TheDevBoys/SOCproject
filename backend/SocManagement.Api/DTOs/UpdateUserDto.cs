using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class UpdateUserDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

}

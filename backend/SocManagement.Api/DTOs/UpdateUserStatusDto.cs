using System.ComponentModel.DataAnnotations;
using SocManagement.Api.Enums;

namespace SocManagement.Api.DTOs;

public class UpdateUserStatusDto
{
    [Required]
    public UserStatus? Status { get; set; }
}

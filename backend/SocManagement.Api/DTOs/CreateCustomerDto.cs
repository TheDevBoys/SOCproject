using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class CreateCustomerDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}

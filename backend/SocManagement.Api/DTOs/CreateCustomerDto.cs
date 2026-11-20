using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

// Wat de client opstuurt om een klant aan te maken.
// Alleen de naam: het Id kiest de database zelf.
public class CreateCustomerDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}

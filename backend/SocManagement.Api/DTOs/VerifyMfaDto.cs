using System.ComponentModel.DataAnnotations;

namespace SocManagement.Api.DTOs;

public class VerifyMfaDto
{
    [Required]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "The code must be 6 digits.")]
    public string Code { get; set; } = string.Empty;
}

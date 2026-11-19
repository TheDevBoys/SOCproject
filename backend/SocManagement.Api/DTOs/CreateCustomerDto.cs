namespace SocManagement.Api.DTOs;

// Wat de client opstuurt om een klant aan te maken.
// Alleen de naam: het Id kiest de database zelf.
public class CreateCustomerDto
{
    public string Name { get; set; } = string.Empty;
}

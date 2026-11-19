namespace SocManagement.Api.DTOs;

// Wat de server teruggeeft over een klant.
// Geen Tickets of Alerts: dat zijn lijsten met navigation properties
// en die veroorzaken een kring in de JSON.
public class CustomerDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
}

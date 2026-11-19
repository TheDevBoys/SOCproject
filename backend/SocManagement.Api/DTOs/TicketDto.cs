using SocManagement.Api.Models;

namespace SocManagement.Api.DTOs;

public class TicketDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    // Ernst van het incident: Low, Medium, High of Critical (enum).
    public Severity Severity { get; set; }

    public string Priority { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    // Alleen het NUMMER van de klant, niet het hele Customer-object.
    // Zo voorkomen we de kring in de JSON.
    public int CustomerId { get; set; }

    // Het nummer van de toegewezen gebruiker.
    // Guid? = mag leeg zijn, want een ticket hoeft niet toegewezen te zijn.
    public Guid? AssignedUserId { get; set; }
}
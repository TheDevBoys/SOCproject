using SocManagement.Api.Models;

namespace SocManagement.Api.DTOs;

public class TicketDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public Severity Severity { get; set; }

    public string Priority { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int CustomerId { get; set; }

    public Guid? AssignedUserId { get; set; }

        // Naam van de klant, zodat de frontend niet zelf hoeft te zoeken.
    public string CustomerName { get; set; } = string.Empty;

    // Naam van de eigenaar. string? = mag leeg zijn, want een ticket
    // hoeft niet toegewezen te zijn.
    public string? AssignedUserName { get; set; }

    // Wanneer de SLA afloopt. DateTime? = leeg als er geen SLA is.
    // De frontend rekent zelf uit hoeveel tijd er nog over is.
    public DateTime? SlaDeadline { get; set; }

    // Hoeveel alerts aan dit ticket hangen.
    public int AlertCount { get; set; }

    // Laatste wijziging: de nieuwste regel uit de geschiedenis,
    // of de aanmaakdatum als er nog niets is gewijzigd.
    public DateTime LastUpdated { get; set; }
}
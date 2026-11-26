using SocManagement.Api.Models;

namespace SocManagement.Api.DTOs;

// Wat de server teruggeeft over een alert.
public class AlertDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;

    // Waar de alert vandaan komt, bijvoorbeeld "EDR" of "Firewall".
    public string Source { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }

    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;

    // Aan welk ticket de alert hangt. int? = leeg als hij nog nergens aan hangt.
    public int? TicketId { get; set; }
}
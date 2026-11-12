namespace SocManagement.Api.Models;

public class Alert
{
    public int Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = string.Empty;

    // Customer 1 - 0..* Alert (required)
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    // Ticket 0..1 - 0..* Alert (optional)
    public int? TicketId { get; set; }
    public Ticket? Ticket { get; set; }
}

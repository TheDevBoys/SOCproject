namespace SocManagement.Api.Models;

public class TicketHistory
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }

    // Ticket 1 - 0..* TicketHistory (required)
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    // User 1 - 0..* TicketHistory (who performed the action, required)
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

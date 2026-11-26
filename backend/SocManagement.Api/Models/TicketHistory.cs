namespace SocManagement.Api.Models;

public class TicketHistory
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }

    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

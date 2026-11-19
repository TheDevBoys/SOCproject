namespace SocManagement.Api.Models;

public class SLA
{
    public int Id { get; set; }
    public int ResponseTimeInMinutes { get; set; }
    public DateTime Deadline { get; set; }

    // Ticket 1 - 1 SLA (required)
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;
}

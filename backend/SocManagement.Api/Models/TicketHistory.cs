namespace SocManagement.Api.Models;

public class TicketHistory
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

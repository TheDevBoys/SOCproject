namespace SocManagement.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Customer 1 - 0..* Ticket / Alert
    public List<Ticket> Tickets { get; set; } = new();
    public List<Alert> Alerts { get; set; } = new();
}

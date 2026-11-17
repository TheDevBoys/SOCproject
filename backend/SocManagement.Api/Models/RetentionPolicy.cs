namespace SocManagement.Api.Models;

public class RetentionPolicy
{
    public int Id { get; set; }
    public int RetentionPeriodInDays { get; set; }

    // RetentionPolicy 0..1 - 0..* Ticket
    public List<Ticket> Tickets { get; set; } = new();
}

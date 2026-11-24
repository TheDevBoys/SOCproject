namespace SocManagement.Api.Models;

public class RetentionPolicy
{
    public int Id { get; set; }
    public int RetentionPeriodInDays { get; set; }

    public List<Ticket> Tickets { get; set; } = new();
}

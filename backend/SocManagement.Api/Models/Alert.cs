namespace SocManagement.Api.Models;

public class Alert
{
    public int Id { get; set; }
    public string Source { get; set; } = string.Empty;

    public string Title {get; set;} = string.Empty;// korte omschrijving van de alert, "Ransomware behaviour: mass file encryption".

    public Severity Severity { get; set; }
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = string.Empty;

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int? TicketId { get; set; }
    public Ticket? Ticket { get; set; }
}

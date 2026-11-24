namespace SocManagement.Api.Models;

public class Communication
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }


    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;


    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

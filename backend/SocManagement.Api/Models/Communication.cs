namespace SocManagement.Api.Models;

public class Communication
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Ticket 1 - 0..* Communication (required)
    public int TicketId { get; set; }
    public Ticket Ticket { get; set; } = null!;

    // User 1 - 0..* Communication (author, required)
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

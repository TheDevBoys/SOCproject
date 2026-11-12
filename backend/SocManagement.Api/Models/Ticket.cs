namespace SocManagement.Api.Models;

public class Ticket
{
    public int Id { get; set; } // property of an object
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty; // string.Empty prevents null values in the database, which could cause a crash.
    public string Status { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer {get; set;} = null!; // customer 1-0.* ticket 

    public int? AssigndeUserId { get; set; } // int? zorgt ervoor dat kolom leeg mag zijn.
    public User? AssignedUser {get; set;}// user 0..1-0.* ticket assgined user mag leeg zijn, ticket mag ook leeg zijn.
    public int? RetentionPolicyId { get; set; }
    public RetentionPolicy? RetentionPolicy { get; set; }

    // Ticket 1 - 1 SLA (the TicketId is stored in SLA)
    public SLA? Sla { get; set; }

    public List<Communication> Communications {get; set;} = new(); // lijst met communicatie objecten, communications als naam en new() zodat het meteen lege lijst is die niet null mag zijn.
    public List<TicketHistory> History {get; set;} = new(); 
    public List<Alert> Alerts {get; set;} = new();
}

namespace SocManagement.Api.Models;

public class Ticket
{
    public int Id { get; set; } 
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty; 
    public string Status { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer {get; set;} = null!; 

    public Guid? AssignedUserId { get; set; } 
    public User? AssignedUser { get; set; } 
    public int? RetentionPolicyId { get; set; }
    public RetentionPolicy? RetentionPolicy { get; set; }


    public SLA? Sla { get; set; }

    public List<Communication> Communications {get; set;} = new(); 
    public List<TicketHistory> History {get; set;} = new(); 
    public List<Alert> Alerts {get; set;} = new();
}

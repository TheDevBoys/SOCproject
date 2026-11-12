namespace SocManagement.Api.Models;

public class SLA
{
    public int Id { get; set; }
    public int ResponseTimeInMinutes { get; set; }
    public DateTime Deadline { get; set; }
}

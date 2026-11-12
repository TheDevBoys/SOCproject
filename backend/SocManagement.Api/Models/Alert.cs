namespace SocManagement.Api.Models;

public class Alert
{
    public int Id { get; set; }
    public string Source { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public DateTime Timestamp { get; set; }
    public string Status { get; set; } = string.Empty;
}

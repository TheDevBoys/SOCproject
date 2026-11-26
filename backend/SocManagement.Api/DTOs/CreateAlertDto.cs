using SocManagement.Api.Models;

namespace SocManagement.Api.DTOs;

// wat er binnen komt als de securitytool een alert stuurt, geen id, status of timestamp, want die worden door de server bepaald.

public class CreateAlertDto
{
    public string Title {get; set;} = string.Empty;

    public string Source { get; set; } = string.Empty;

    public Severity Severity { get; set; }

    public int CustomerId { get; set; }
}
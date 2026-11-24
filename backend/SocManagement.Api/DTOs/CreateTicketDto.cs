using SocManagement.Api.Models;

namespace SocManagement.Api.DTOs;

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Severity Severity { get; set; }
    public string Priority { get; set; } = string.Empty;

    public int CustomerId { get; set; }

    public Guid? AssignedUserId { get; set; }
}
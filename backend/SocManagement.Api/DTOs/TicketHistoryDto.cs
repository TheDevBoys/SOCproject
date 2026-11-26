namespace SocManagement.Api.DTOs;

public class TicketHistoryDto
{
    public int Id {get; set;}

    public string Action {get; set;} = string.Empty;

    public DateTime Timestamp {get; set;}

    public Guid UserId {get; set;}
    public string UserName {get; set;} = string.Empty;
}
namespace SocManagement.Api.DTOs;

public class UpdateTicketStatusDto
{
    public string Status {get; set;} = string.Empty;
    // wat klant stuurt om de status van een ticket te wijzigen, alleen de nieuwe status verder niks.
}
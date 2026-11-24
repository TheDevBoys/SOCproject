namespace SocManagement.Api.DTOs;

public class AssignTicketDto
{
    public Guid? AssignedUserId {get; set;}// guid is type net als int en string, die gebruiken we voor gebruikers of tickets meestal geeft een unieke id waarmee we de gebruiker of ticket mee kunnen identificeren.
}
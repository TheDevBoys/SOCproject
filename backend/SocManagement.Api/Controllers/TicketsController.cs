using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;

namespace SocManagement.Api.Controllers;

//verteld asp.net dat dit een api controller is.
[ApiController]
//route bepaalt de adres. alle methodes in de controller zijn bereikbaar via .../api/tickets
[Route("api/tickets")]

public class TicketsController : ControllerBase
{
    // verbinding met de database. private en readonly dit betekend dat dit alleen deze klasse er bij mag en na het instellen niet meer aangepast kan worden.
    private readonly SocDbContext _context;

    public TicketsController(SocDbContext context)// constructor dependency injection
    {
        _context = context;
    }

    [HttpGet]// dit is een get methode. deze methode wordt uitgevoerd als er een get request naar de route gestuurd wordt.
    public async Task<ActionResult<List<TicketDto>>> GetTickets()
    {
        var tickets = await _context.Tickets // varaiable aanmaken waar bij _context.Tickets de tabel tickets uit de db haalt.
        .Select(t => new TicketDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Severity = t.Severity,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                CustomerId = t.CustomerId,
                AssignedUserId = t.AssignedUserId
            })
        .ToListAsync();// voert de query uit en zet het resultaat in een lijst.
        return Ok(tickets);// returnt de lijst met tickets in een ok response. dankzijn ActionResult<list..
}
}
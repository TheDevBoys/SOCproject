using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;

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
    [HttpGet("{id:int}")]
    public async  Task<ActionResult<TicketDto>> GetTicket(int id){
        var ticket = await _context.Tickets.Where(t => t.Id == id).Select(t => new TicketDto// where zoekt naar de ticket waar id gelijk is aan id
        {// select zet de ticket om naar ticket dto
            Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Severity = t.Severity,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                CustomerId = t.CustomerId,
                AssignedUserId = t.AssignedUserId
        }).FirstOrDefaultAsync();// geef het eerste resultaat of null als er geen ticket bestaat

        if(ticket == null)
        {
            return NotFound();
        }
    return Ok(ticket);
    }

    [HttpPost]
   public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketDto dto)
    {
        
        var customerExists = await _context.Customers
            .AnyAsync(c => c.Id == dto.CustomerId);// anyasync geeft true als er minstens 1 een klant met dit id is.

        if (!customerExists)
        {
            return BadRequest("Customer does not exist.");
        }

        // Is er een gebruiker meegegeven? Dan moet die echt bestaan.
        // HasValue = true als AssignedUserId niet null is.
        if (dto.AssignedUserId.HasValue)
        {
            // Zoek of er een gebruiker met dit Id in de database staat.
            // .Value haalt de echte Guid uit de Guid? (die mag null zijn).
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == dto.AssignedUserId.Value);

            // Bestaat hij niet? Geef 400 in plaats van een crash (500).
            if (!userExists)
            {
                return BadRequest("Assigned user does not exist.");
            }
        }

        // new ticket model van de data uit de dto
        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = "Open",              
            Severity = dto.Severity,
            Priority = dto.Priority,
            CreatedAt = DateTime.UtcNow,   
            CustomerId = dto.CustomerId,
            AssignedUserId = dto.AssignedUserId
        };

        _context.Tickets.Add(ticket);// add zet klaar om op te slaan nog niet..

        await _context.SaveChangesAsync();// savechangesasync slaat het echt op in de database daarna heeft ticket.id de waarde die de database heeft gekozen.

        var result = new TicketDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status,
            Severity = ticket.Severity,
            Priority = ticket.Priority,
            CreatedAt = ticket.CreatedAt,
            CustomerId = ticket.CustomerId,
            AssignedUserId = ticket.AssignedUserId
        };
        // CreatedAtAction = statuscode 201 (aangemaakt) en in de header
        // staat de URL van het nieuwe ticket (verwijst naar GetTicket).
        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, result);
    }
}
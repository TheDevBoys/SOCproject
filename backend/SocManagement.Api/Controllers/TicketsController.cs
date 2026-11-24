using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // nodig om de ingelogde gebruikers te lezen.

namespace SocManagement.Api.Controllers;

//verteld asp.net dat dit een api controller is.
[ApiController]
//authorisatie, niet ingelogd direct 401
[Authorize]
//route bepaalt de adres. alle methodes in de controller zijn bereikbaar via .../api/tickets
[Route("api/tickets")]


public class TicketsController : ControllerBase
{
    // verbinding met de database. private en readonly dit betekend dat dit alleen deze klasse er bij mag en na het instellen niet meer aangepast kan worden.
    private readonly SocDbContext _context;
    private static readonly string[] AllowedStatuses = {"Open", "InProgress", "Closed"};
    public TicketsController(SocDbContext context)// constructor dependency injection
    {
        _context = context;
    }

    [HttpGet]// dit is een get methode. deze methode wordt uitgevoerd als er een get request naar de route gestuurd wordt.
    public async Task<ActionResult<List<TicketDto>>> GetTickets()
    {
        var tickets = await _context.Tickets // varaiable aanmaken waar bij _context.Tickets de tabel tickets uit de db haalt.
        .Select(t => ToDto(t))
        .ToListAsync();// voert de query uit en zet het resultaat in een lijst.
        return Ok(tickets);// returnt de lijst met tickets in een ok response. dankzijn ActionResult<list..
    }
    [HttpGet("{id:int}")]
    public async  Task<ActionResult<TicketDto>> GetTicket(int id){
        var ticket = await _context.Tickets
            .Where(t => t.Id == id) // where zoekt naar de ticket waar id gelijk is aan id
            .Select(t => ToDto(t)) // select zet de ticket om naar ticket dto
            .FirstOrDefaultAsync(); // geef het eerste resultaat of null als er geen ticket bestaat

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

        var result = ToDto(ticket);
        // CreatedAtAction = statuscode 201 (aangemaakt) en in de header
        // staat de URL van het nieuwe ticket (verwijst naar GetTicket).
        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, result);
    }

    [HttpPatch("{id:int}/status")]// patch dus deel van iets wijzigen.
    
    public async Task<ActionResult<TicketDto>> UpdateStatus(int id, UpdateTicketStatusDto dto)
    {
        if(!AllowedStatuses.Contains(dto.Status))
        {
            return BadRequest("Status must be Open, InProgress or Closed.");
        }

        var ticket = await _context.Tickets.FindAsync(id); // findasync op basis van id(pk), model word gebruikt geen dto

        if(ticket == null)
        {
            return NotFound();
        }

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!); // id ophalen van de gebruiker om later te achterhalen wie het heeft aangepast.

        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            UserId = userId,
            Action = $"Status changed from {ticket.Status} to {dto.Status}",
            Timestamp = DateTime.UtcNow
        });// dit is de geschiedenis opslag die we maken van wat er gebeurd is om het later terug te kunnen vinden wie de status heeft aangepast.

        ticket.Status = dto.Status;// past de status aan, ef core ziet zelf dat het ticket is veranderd.

        await _context.SaveChangesAsync();// slaat alles ineen keer op.

        // nu geven de aangepast dto terug dus de 2e ronden van de dto waar die na de database weer na de model word terug gestuurd.
        return Ok(ToDto(ticket));
    }
    [HttpPatch("{id:int}/assign")]
    public async Task<ActionResult<TicketDto>> AssignTicket(int id, AssignTicketDto dto)
    {
        var ticket = await _context.Tickets.FindAsync(id);//  zoek ticket die we gaan wijzigen.

        if (ticket == null)// wanneer de ticket niet bestaat stuur je fout code
        {
            return NotFound();
        }

        if (dto.AssignedUserId.HasValue) 
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.AssignedUserId.Value);

            if (!userExists)
            {
                return BadRequest("Assigned user does not exist.");
            }
        }
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Tekst voor de geschiedenis: toegewezen of toewijzing weggehaald.
        var action = dto.AssignedUserId.HasValue
        ? $"Assigned to user {dto.AssignedUserId.Value}"//? korte if else als de eerste niet waar is de dan : -> tweede.
        : "Assignment removed";

        // schrijven van geschiedenis wie wat heeft gedaan.
        _context.TicketHistories.Add(new TicketHistory
        {
            TicketId = ticket.Id,
            UserId = userId,
            Action = action,
            Timestamp = DateTime.UtcNow
        });
        // toewijzing aanpassen 
        ticket.AssignedUserId = dto.AssignedUserId;

        //sla de wijziging van de geschiedenisregel samen op.
        await _context.SaveChangesAsync();

         // Geef het bijgewerkte ticket terug (200).
        return Ok(ToDto(ticket));
    }

    // Hulpmethode: zet een Ticket (model) om naar een TicketDto.
    // private = alleen deze controller gebruikt hem.
    // static = hij heeft niets van de controller nodig (geen _context),
    //          alleen het ticket dat je meegeeft.
    // Moet er later een veld bij? Dan pas je alleen deze methode aan.
    private static TicketDto ToDto(Ticket ticket)
    {
        return new TicketDto
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
    }
}

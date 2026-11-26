using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; // nodig om de ingelogde gebruikers te lezen.
using System.Linq.Expressions; // nodig voor Expression

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
        .Select(ToDto)
        .ToListAsync();// voert de query uit en zet het resultaat in een lijst.
        return Ok(tickets);// returnt de lijst met tickets in een ok response. dankzijn ActionResult<list..
    }
    [HttpGet("{id:int}")]
    public async  Task<ActionResult<TicketDto>> GetTicket(int id){
        var ticket = await _context.Tickets
            .Where(t => t.Id == id) // where zoekt naar de ticket waar id gelijk is aan id
            .Select(ToDto) // select zet de ticket om naar ticket dto
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

        var result = await GetDtoAsync(ticket.Id);
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
        return Ok(await GetDtoAsync(ticket.Id));
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
        return Ok(await GetDtoAsync(ticket.Id));
    }

    // Omschrijving hoe je van een Ticket een TicketDto maakt.
    // Expression = EF kan dit vertalen naar SQL, met de JOINs erbij.
    // Daarom kunnen we hier ook velden uit andere tabellen gebruiken.
    // Moet er later een veld bij? Dan pas je alleen dit aan.
    private static readonly Expression<Func<Ticket, TicketDto>> ToDto = t => new TicketDto
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Status = t.Status,
        Severity = t.Severity,
        Priority = t.Priority,
        CreatedAt = t.CreatedAt,
        CustomerId = t.CustomerId,
        AssignedUserId = t.AssignedUserId,

        // Via de navigation property naar de tabel Customers.
        CustomerName = t.Customer.Name,

        // Niet toegewezen? Dan null, anders de naam van de gebruiker.
        AssignedUserName = t.AssignedUser != null ? t.AssignedUser.Name : null,

        // Geen SLA? Dan null, anders de deadline.
        SlaDeadline = t.Sla != null ? t.Sla.Deadline : null,

        // Count = tel hoeveel alerts er in de lijst zitten.
        AlertCount = t.Alerts.Count,

        // Max = de nieuwste tijd uit de geschiedenis.
        // (DateTime?) zorgt dat het null mag zijn als er geen geschiedenis is.
        // ?? = "als links null is, gebruik dan rechts".
        LastUpdated = t.History.Max(h => (DateTime?)h.Timestamp) ?? t.CreatedAt
    };

    // Haalt één ticket op als TicketDto, met alle velden uit de andere tabellen.
    // Dit gebruiken we na het opslaan in Create, UpdateStatus en AssignTicket.
    // Niet static, want hij heeft _context nodig.
    private async Task<TicketDto> GetDtoAsync(int id)
    {
        return await _context.Tickets
            .Where(t => t.Id == id)
            .Select(ToDto)
            .FirstAsync(); // First = het ticket bestaat zeker, want we hebben het net opgeslagen
    }
    [HttpGet("{id:int}/history")]
    public async Task<ActionResult<List<TicketHistoryDto>>> GetTicketHistory(int id)// <list< gebruiken als we meerdere objecten willen terug zien.
    {
        var ticketExists = await _context.Tickets.AnyAsync(t => t.Id == id);

        if (!ticketExists)
        {
            return NotFound();
        }

         var history = await _context.TicketHistories
            // Alleen de regels van dit ticket.
            .Where(h => h.TicketId == id)
            // Nieuwste bovenaan. Descending = van groot naar klein.
            .OrderByDescending(h => h.Timestamp)
            // Hier koppel je de DTO aan de data (links DTO, rechts model).
            .Select(h => new TicketHistoryDto
            {
                Id = h.Id,
                Action = h.Action,
                Timestamp = h.Timestamp,
                UserId = h.UserId,
                // Via de navigation property User naar de tabel Users.
                // EF maakt hier zelf een JOIN van.
                UserName = h.User.Name
            })
            // Voer de query uit en zet het resultaat in een lijst.
            .ToListAsync();

        // 200 met de lijst als JSON.
        return Ok(history);
    }
}

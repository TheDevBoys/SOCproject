using System.Linq.Expressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;

namespace SocManagement.Api.Controllers;

[ApiController]
[Authorize]// alleen ingelogde gebruikers mogen deze controller gebruiken
[Route("api/alerts")]// alle methodes bereikbaar via .../api/alerts

public class AlertController : ControllerBase
{
    private readonly SocDbContext _context;

    public AlertController(SocDbContext context)
    {
        _context = context;
    }

    // get api alerts
    // De nieuwste alerts bovenaan, zoals in een alert queue.
    [HttpGet]
    public async Task<ActionResult<List<AlertDto>>> GetAlerts()
    {
        var alerts = await _context.Alerts
            .OrderByDescending(a => a.Timestamp)
            .Select(ToDto)
            .ToListAsync();
        
        return Ok(alerts);
    }
     // GET api/alerts/{id}
    // Haal een alert op met dit id.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AlertDto>> GetAlert(int id)
    {
        var alert = await _context.Alerts
            .Where(a => a.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync();

        if (alert == null)
        {
            return NotFound();
        }

        return Ok(alert);
    }

    // POST api/alerts
    // Een nieuwe alert binnenkrijgen (later doet de securitytooling dit).
    [HttpPost]
    public async Task<ActionResult<AlertDto>> CreateAlert(CreateAlertDto dto)
    {
        var customerExists = await _context.Customers
            .AnyAsync(c => c.Id == dto.CustomerId);

        if (!customerExists)
        {
            return BadRequest("Customer does not exist.");
        }

        var alert = new Alert
        {
            Title = dto.Title,
            Source = dto.Source,
            Severity = dto.Severity,
            CustomerId = dto.CustomerId,
            Status = "New",               // een nieuwe alert begint altijd als New
            Timestamp = DateTime.UtcNow   // tijd bepaalt de server
            // TicketId blijft leeg: de alert hangt nog nergens aan
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();

        var result = await _context.Alerts
            .Where(a => a.Id == alert.Id)
            .Select(ToDto)
            .FirstAsync();

        return CreatedAtAction(nameof(GetAlert), new { id = alert.Id }, result);
    }
     private static readonly Expression<Func<Alert, AlertDto>> ToDto = a => new AlertDto
    {
        Id = a.Id,
        Title = a.Title,
        Source = a.Source,
        Severity = a.Severity,
        Status = a.Status,
        Timestamp = a.Timestamp,
        CustomerId = a.CustomerId,
        CustomerName = a.Customer.Name,
        TicketId = a.TicketId
    };

        // POST api/alerts/5/promote
    // Maakt van een alert een ticket (case) en koppelt de alert daaraan.
    // POST en geen PATCH, omdat er iets nieuws wordt aangemaakt: een ticket.
    [HttpPost("{id:int}/promote")]
    public async Task<ActionResult<AlertDto>> PromoteToCase(int id)
    {
        var alert = await _context.Alerts.FindAsync(id);

        if (alert == null)
        {
            return NotFound();
        }

        // Hangt de alert al aan een ticket? Dan niet nog een keer promoten.
        // 409 Conflict = het verzoek botst met de huidige toestand.
        if (alert.TicketId != null)
        {
            return Conflict("Alert is already linked to a case.");
        }

        // Nieuw ticket met de gegevens van de alert.
        var ticket = new Ticket
        {
            Title = alert.Title,
            Description = $"Promoted from alert {alert.Id} ({alert.Source}).",
            Status = "Open",
            Severity = alert.Severity,
            Priority = "",                 // vult de analist later in
            CreatedAt = DateTime.UtcNow,
            CustomerId = alert.CustomerId  // zelfde klant als de alert
        };

        // De alert aan het nieuwe ticket koppelen.
        // We zetten de navigation property, niet het Id: het ticket heeft
        // nog geen Id, want het is nog niet opgeslagen. EF regelt dat zelf.
        alert.Ticket = ticket;
        alert.Status = "Promoted";

        // Eén keer opslaan: EF slaat eerst het ticket op, krijgt het Id,
        // en vult dat daarna in bij alert.TicketId.
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        var result = await _context.Alerts
            .Where(a => a.Id == alert.Id)
            .Select(ToDto)
            .FirstAsync();

        return Ok(result);
    }

}


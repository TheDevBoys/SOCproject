using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;

namespace SocManagement.Api.Controllers;


[ApiController]

[Route("api/tickets")]

public class TicketsController : ControllerBase
{
    private readonly SocDbContext _context;

    public TicketsController(SocDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<TicketDto>>> GetTickets()
    {
        var tickets = await _context.Tickets 
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
        .ToListAsync();
        return Ok(tickets);
    }
    [HttpGet("{id:int}")]
    public async  Task<ActionResult<TicketDto>> GetTicket(int id){
        var ticket = await _context.Tickets.Where(t => t.Id == id).Select(t => new TicketDto
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
        }).FirstOrDefaultAsync();

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
            .AnyAsync(c => c.Id == dto.CustomerId);

        if (!customerExists)
        {
            return BadRequest("Customer does not exist.");
        }


        if (dto.AssignedUserId.HasValue)
        {
 
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == dto.AssignedUserId.Value);


            if (!userExists)
            {
                return BadRequest("Assigned user does not exist.");
            }
        }


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

        _context.Tickets.Add(ticket);

        await _context.SaveChangesAsync();

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

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, result);
    }
}
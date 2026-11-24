using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
namespace SocManagement.Api.Controllers;

// Vertelt ASP.NET dat dit een API-controller is.
// Dit zorgt ook dat een object-parameter (zoals CreateCustomerDto)
// automatisch uit de JSON in de body van het verzoek komt.
[ApiController]
[Authorize]
// Alle methodes in deze controller zijn bereikbaar via .../api/customers
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    // Verbinding met de database.
    // private readonly = alleen deze klasse mag erbij en hij wordt niet meer vervangen.
    private readonly SocDbContext _context;

    // Constructor met dependency injection: ASP.NET geeft de SocDbContext zelf mee.
    public CustomersController(SocDbContext context)
    {
        _context = context;
    }

    // GET http://localhost:3001/api/customers
    // Geeft alle klanten terug.
    [HttpGet]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers()
    {
        // Select zet elke Customer om naar een CustomerDto.
        // ToListAsync haalt het resultaat uit de database als lijst.
        var customers = await _context.Customers
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        // 200 met de lijst als JSON.
        return Ok(customers);
    }

    // GET http://localhost:3001/api/customers/5
    // {id:int} = het getal uit de URL komt in de parameter id.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        // Zoek de klant met dit Id en zet hem om naar een CustomerDto.
        // FirstOrDefaultAsync geeft null als hij niet bestaat.
        var customer = await _context.Customers
            .Where(c => c.Id == id)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .FirstOrDefaultAsync();

        // Niet gevonden: statuscode 404.
        if (customer == null)
        {
            return NotFound();
        }

        // Gevonden: statuscode 200 met de klant.
        return Ok(customer);
    }

    // POST http://localhost:3001/api/customers
    // Maakt een nieuwe klant aan.
    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto dto)
    {
        // Maak een nieuw Customer-model van de data uit de DTO.
        var customer = new Customer
        {
            Name = dto.Name
        };

        // Add = klaarzetten om op te slaan (nog niet in de database).
        _context.Customers.Add(customer);

        // SaveChangesAsync = echt opslaan. Daarna heeft customer.Id een waarde.
        await _context.SaveChangesAsync();

        // Zet het opgeslagen model om naar een DTO voor het antwoord.
        var result = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name
        };

        // 201 (aangemaakt) met de URL van de nieuwe klant in de header.
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, result);
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Models;

namespace SocManagement.Api.Controllers;


[ApiController]

[Route("api/customers")]
public class CustomersController : ControllerBase
{

    private readonly SocDbContext _context;


    public CustomersController(SocDbContext context)
    {
        _context = context;
    }


    [HttpGet]
    public async Task<ActionResult<List<CustomerDto>>> GetCustomers()
    {

        var customers = await _context.Customers
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(customers);
    }


    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {

        var customer = await _context.Customers
            .Where(c => c.Id == id)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .FirstOrDefaultAsync();


        if (customer == null)
        {
            return NotFound();
        }


        return Ok(customer);
    }


    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            Name = dto.Name
        };


        _context.Customers.Add(customer);

        await _context.SaveChangesAsync();

        var result = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name
        };

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, result);
    }
}

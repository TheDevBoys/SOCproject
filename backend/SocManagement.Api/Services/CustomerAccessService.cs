using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;

namespace SocManagement.Api.Services;

public class CustomerAccessService : ICustomerAccessService
{
    private readonly SocDbContext _context;

    public CustomerAccessService(SocDbContext context)
    {
        _context = context;
    }

    public async Task<List<int>> GetAllowedCustomerIdsAsync(Guid userId)
    {
        return await _context.CustomerAccesses
            .AsNoTracking()
            .Where(ca => ca.UserId == userId)
            .Select(ca => ca.CustomerId)
            .ToListAsync();
    }
}
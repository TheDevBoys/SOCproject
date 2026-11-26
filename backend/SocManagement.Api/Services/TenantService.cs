using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;

namespace SocManagement.Api.Services;

public class TenantService : ITenantService
{
    private readonly SocDbContext _context;

    public TenantService(SocDbContext context)
    {
        _context = context;
    }

    public async Task<List<int>> GetAllowedCustomerIdsAsync(Guid userId)
    {
        return await _context.TenantAccesses
            .AsNoTracking()
            .Where(ta => ta.UserId == userId)
            .Select(ta => ta.CustomerId)
            .ToListAsync();
    }
}
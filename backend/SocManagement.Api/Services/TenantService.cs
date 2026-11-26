using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;
using SocManagement.Api.DTOs;
using SocManagement.Api.Enums;
using SocManagement.Api.Models;

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

        // Klanten waartoe een gebruiker toegang heeft; null als de gebruiker niet bestaat.
    public async Task<List<CustomerDto>?> GetCustomersForUserAsync(Guid userId)
    {
        if (!await _context.Users.AnyAsync(u => u.Id == userId))
        {
            return null;
        }

        return await _context.TenantAccesses
            .AsNoTracking()
            .Where(ta => ta.UserId == userId)
            .OrderBy(ta => ta.Customer.Name)
            .Select(ta => new CustomerDto
            {
                Id = ta.Customer.Id,
                Name = ta.Customer.Name
            })
            .ToListAsync();
    }

    public async Task<TenantAccessResult> GrantAsync(Guid userId, int customerId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return TenantAccessResult.UserNotFound;
        }

        // RRM: alleen medewerkers krijgen KlantToegang.
        if (user.Role == nameof(UserRole.Customer))
        {
            return TenantAccessResult.NotAnEmployee;
        }

        if (!await _context.Customers.AnyAsync(c => c.Id == customerId))
        {
            return TenantAccessResult.CustomerNotFound;
        }

        if (await _context.TenantAccesses.AnyAsync(ta => ta.UserId == userId && ta.CustomerId == customerId))
        {
            return TenantAccessResult.AlreadyGranted;
        }

        _context.TenantAccesses.Add(new TenantAccess
        {
            UserId = userId,
            CustomerId = customerId,
            GrantedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return TenantAccessResult.Granted;
    }

    public async Task<bool> RevokeAsync(Guid userId, int customerId)
    {
        var access = await _context.TenantAccesses.FindAsync(userId, customerId);

        if (access == null)
        {
            return false;
        }

        _context.TenantAccesses.Remove(access);
        await _context.SaveChangesAsync();

        return true;
    }
}
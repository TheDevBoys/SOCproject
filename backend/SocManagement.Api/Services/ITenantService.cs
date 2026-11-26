namespace SocManagement.Api.Services;

public interface ITenantService
{
    Task<List<int>> GetAllowedCustomerIdsAsync(Guid userId);
}
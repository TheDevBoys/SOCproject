namespace SocManagement.Api.Services;

public interface ICustomerAccessService
{
    Task<List<int>> GetAllowedCustomerIdsAsync(Guid userId);
}
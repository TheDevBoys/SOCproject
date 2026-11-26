using SocManagement.Api.DTOs;

namespace SocManagement.Api.Services;

public interface ITenantService
{
    Task<List<int>> GetAllowedCustomerIdsAsync(Guid userId);

    Task<List<CustomerDto>?> GetCustomersForUserAsync(Guid userId);

    Task<TenantAccessResult> GrantAsync(Guid userId, int customerId);

    Task<bool> RevokeAsync(Guid userId, int customerId);
}

public enum TenantAccessResult
{
    Granted,
    UserNotFound,
    CustomerNotFound,
    NotAnEmployee,
    AlreadyGranted
}
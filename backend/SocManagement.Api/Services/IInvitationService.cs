using SocManagement.Api.Models;
using SocManagement.Api.Enums;
using SocManagement.Api.DTOs;


namespace SocManagement.Api.Services;

public interface IInvitationService
{
    Task<UserInvitation> InviteUserAsync(string name, string email, string role, int? customerId = null, TimeSpan? expiration = null);

    Task<UserInvitation?> ValidateInvitationAsync(string token);

    Task AcceptInvitationAsync(AcceptInvitationDto request);
}
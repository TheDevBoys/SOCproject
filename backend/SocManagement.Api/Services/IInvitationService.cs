using SocManagement.Api.Models;
using SocManagement.Api.Enums;
using SocManagement.Api.DTOs;


namespace SocManagement.Api.Services;

public interface IInvitationService
{
    Task<UserInvitation> InviteUserAsync(string name, string email, UserRole role, TimeSpan? expiration = null);

    Task<UserInvitation?> ValidateInvitationAsync(string token);

    Task AcceptInvitationAsync(AcceptInvitationDto request);
}
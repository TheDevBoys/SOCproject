namespace SocManagement.Api.Services;

public interface IEmailService
{
    Task SendEmailAsync(
        string to,
        string subject,
        string htmlBody
    );

    Task SendInvitationEmailAsync(
        string email,
        string name,
        string invitationUrl
    );
}
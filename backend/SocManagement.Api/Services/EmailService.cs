using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Encodings.Web;

namespace SocManagement.Api.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IWebHostEnvironment _environment;

    public EmailService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<EmailService> logger,
        IWebHostEnvironment environment)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _environment = environment;
    }

    public async Task SendInvitationEmailAsync(
        string email,
        string name,
        string invitationUrl)
    {


        var templatePath = Path.Combine(
            _environment.ContentRootPath,
            "EmailTemplates",
            "userInvitation.html"
        );

        var html = await File.ReadAllTextAsync(templatePath);

        html = html
            .Replace("{{Name}}", WebUtility.HtmlEncode(name))
            .Replace("{{InvitationUrl}}", HtmlEncoder.Default.Encode(invitationUrl));

        await SendEmailAsync(
            email,
            "You're invited to DevBoyz SOC",
            html
        );
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string htmlBody)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        var fromEmail = _configuration["Resend:FromEmail"];


        var payload = new
        {
            from = $"DevBoyz SOC <{fromEmail}>",
            to = new[] { to },
            subject,
            html = htmlBody
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.resend.com/emails"
        );

        request.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = JsonContent.Create(payload);

        using var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Failed to send email. Status: {StatusCode}",
                response.StatusCode
            );

            throw new HttpRequestException(
                $"Resend failed with status code {(int)response.StatusCode}."
            );
        }

        _logger.LogInformation("Email accepted by Resend.");
    }
}
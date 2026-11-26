using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Encodings.Web;
using System.Text.Json;

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
        var apiKey = _configuration["Resend:ApiKey"]?.Trim();
        var fromEmail = _configuration["Resend:FromEmail"]?.Trim();

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new EmailProviderException("Email sending is not configured. Check Resend:ApiKey and Resend:FromEmail on the backend.");
        }

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
            string? providerMessage = null;

            try
            {
                using var error = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                if (error.RootElement.ValueKind == JsonValueKind.Object &&
                    error.RootElement.TryGetProperty("message", out var message) &&
                    message.ValueKind == JsonValueKind.String)
                {
                    providerMessage = message.GetString()?.Replace(apiKey, "[redacted]");
                }
            }
            catch (JsonException)
            {
                providerMessage = "Resend returned a non-JSON error response.";
            }

            _logger.LogError(
                "Failed to send email. Status: {StatusCode}. Resend reason: {ProviderMessage}",
                (int)response.StatusCode,
                providerMessage
            );

            var explanation = response.StatusCode switch
            {
                HttpStatusCode.Unauthorized => "Check the Resend API key on the backend.",
                HttpStatusCode.Forbidden => "Check the verified sender domain, API key permissions and test-recipient restrictions in Resend.",
                HttpStatusCode.BadRequest or HttpStatusCode.UnprocessableEntity => "Check the sender and recipient addresses and the Resend error in the backend logs.",
                HttpStatusCode.TooManyRequests => "The Resend sending limit was reached. Try again later and check your Resend limits.",
                _ => "Check the Resend error in the backend logs before trying again."
            };

            throw new EmailProviderException($"Resend rejected the email (HTTP {(int)response.StatusCode}). {explanation}");
        }

        _logger.LogInformation("Email accepted by Resend.");
    }
}

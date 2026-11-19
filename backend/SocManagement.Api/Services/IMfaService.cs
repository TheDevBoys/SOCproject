namespace SocManagement.Api.Services;

public interface IMfaService
{
    string GenerateSecret();

    bool VerifyCode(string secret, string code);

    string GenerateQrCodeUri(string email, string secret);
}
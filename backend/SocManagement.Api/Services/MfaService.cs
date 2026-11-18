using OtpNet;

namespace SocManagement.Api.Services;

public class MfaService : IMfaService
{
    public string GenerateSecret()
    {
        var secret = KeyGeneration.GenerateRandomKey(20);

        return Base32Encoding.ToString(secret);
    }

    public bool VerifyCode(string secret, string code)
    {
        var secretBytes = Base32Encoding.ToBytes(secret);

        var totp = new Totp(secretBytes);

        return totp.VerifyTotp(
            code,
            out _,
            new VerificationWindow(
                previous: 1,
                future: 1
            )
        );
    }

    public string GenerateQrCodeUri(
        string email,
        string secret)
    {
        var issuer = "SOC Management System";

        return $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(email)}" +
               $"?secret={Uri.EscapeDataString(secret)}" +
               $"&issuer={Uri.EscapeDataString(issuer)}" +
               "&algorithm=SHA1&digits=6&period=30";
    }
}
namespace SocManagement.Api.DTOs;

public class MfaSetupResponseDto
{
    public bool SetupRequired { get; set; }

    public string Secret { get; set; } = string.Empty;

    public string QrCodeUri { get; set; } = string.Empty;
}

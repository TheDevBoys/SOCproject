using Microsoft.AspNetCore.Authentication.Cookies;

namespace SocManagement.Api.Auth;

public static class AuthSchemes
{
    public const string Session = CookieAuthenticationDefaults.AuthenticationScheme;

    public const string MfaPending = "MfaPending";
}

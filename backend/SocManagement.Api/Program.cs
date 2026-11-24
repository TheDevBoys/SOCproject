using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using SocManagement.Api.Auth;
using SocManagement.Api.Models;
using SocManagement.Api.Services;
using Microsoft.EntityFrameworkCore;
using SocManagement.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

builder.Services.AddSwaggerGen();

builder.Services.AddDataProtection()
    .SetApplicationName("SocManagement")
    .PersistKeysToDbContext<SocDbContext>();
builder.Services.AddDbContext<SocDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("SocDb"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IMfaService, MfaService>();
builder.Services.AddScoped<IInvitationService, InvitationService>();
builder.Services.AddHttpClient<IEmailService, EmailService>();


builder.Services
    .AddAuthentication(AuthSchemes.Session)
    .AddCookie(AuthSchemes.Session, options =>
    {
        options.Cookie.Name = "soc.session";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
        ConfigureApiCookie(options);
    })
    .AddCookie(AuthSchemes.MfaPending, options =>
    {
        options.Cookie.Name = "soc.mfa";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
        options.SlidingExpiration = false;
        ConfigureApiCookie(options);
    });
builder.Services.AddAuthorization();
var allowedOrigins = (builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
    .Select(origin => Uri.TryCreate(origin.Trim(), UriKind.Absolute, out var uri)
        ? uri.GetLeftPart(UriPartial.Authority)
        : null)
    .OfType<string>()
    .Append("http://localhost:3000")
    .Distinct()
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static void ConfigureApiCookie(CookieAuthenticationOptions options)
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Lax;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
}

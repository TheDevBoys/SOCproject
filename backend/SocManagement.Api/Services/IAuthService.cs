using SocManagement.Api.DTOs;
using SocManagement.Api.Models;

namespace SocManagement.Api.Services;

public interface IAuthService
{
    Task<LoginResult> LoginAsync(LoginRequestDto request);

    Task<MfaSetupResponseDto?> GetMfaSetupAsync(Guid userId);

    Task<User?> VerifyMfaAsync(Guid userId, string code);

    Task<User?> GetUserAsync(Guid userId);
}

public record LoginResult(LoginResponseDto Response, User? User);

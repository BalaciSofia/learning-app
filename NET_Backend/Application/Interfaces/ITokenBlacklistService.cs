namespace Application.Interfaces;

public interface ITokenBlacklistService
{
    Task InvalidateAsync(string jti, DateTime tokenExpiry);
    bool IsBlacklisted(string jti);
}

using Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace Application.UseCases.Authentication;

public class TokenBlacklistService : ITokenBlacklistService
{
    private readonly IMemoryCache _cache;
    private const string KeyPrefix = "blacklisted_jti_";

    public TokenBlacklistService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task InvalidateAsync(string jti, DateTime tokenExpiry)
    {
        var ttl = tokenExpiry - DateTime.UtcNow;
        if (ttl > TimeSpan.Zero)
        {
            _cache.Set(KeyPrefix + jti, true, ttl);
        }
        return Task.CompletedTask;
    }

    public bool IsBlacklisted(string jti) =>
        _cache.TryGetValue(KeyPrefix + jti, out _);
}

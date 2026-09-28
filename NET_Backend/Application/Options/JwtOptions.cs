namespace Application.Options;

public class JwtOptions
{
    public const string SECTION_NAME = "Jwt";

    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public int ExpiryMinutes { get; init; }
}
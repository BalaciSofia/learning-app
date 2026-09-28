using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Interfaces;
using Application.Options;
using Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Application.Common.Constants;

namespace Application.UseCases.Authentication;

public class TokenService : ITokenService
{
    private readonly JwtOptions _jwtOptions;
    private readonly IConfiguration _configuration;

    public TokenService(IOptions<JwtOptions> jwtOptions, IConfiguration configuration)
    {
        _jwtOptions = jwtOptions.Value;
        _configuration = configuration;
    }

    public string GenerateToken(int userId,string name, string email, Role role,int? institutionId = null)
    {
        var secretKey = _configuration[AuthConstants.JwtSecretKey];
        
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new InvalidOperationException("JWT_SECRET_KEY configuration is missing.");
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new  Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        if (institutionId.HasValue)
        {
            claims.Add(new Claim("institution_id", institutionId.Value.ToString()));
        }
        var permissions = GetPermissionsForRole(role);
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    //id say to keep all permissions in the db, not hardcoded in here
    //ALL PERMISSIONS BELLOW ARE JUST SUGGESTIONS
    private static IEnumerable<string> GetPermissionsForRole(Role role) => role switch
    {
        Role.Admin => new[] { "courses:create", "courses:delete", "courses:update", "users:manage" },
        Role.Teacher => new[] { "courses:create", "courses:update", "quiz:create" },
        Role.Student => new[] { "courses:read", "quiz:attempt" },
        _ => Array.Empty<string>()
    };
}
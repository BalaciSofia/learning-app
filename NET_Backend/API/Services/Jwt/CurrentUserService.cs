using System.Security.Claims;
using Application.Interfaces;
using Domain.Enums;
namespace API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
    public int UserId
    {
        get
        {
            var userIdString = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(userIdString, out int parsedId) ? parsedId : 0;
        }
    }

    public string Email => User?.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

    public Role? Role
    {
        get
        {
            var roleString = User?.FindFirstValue(ClaimTypes.Role);
            
            if (Enum.TryParse<Role>(roleString, out var parsedRole))
            {
                return parsedRole;
            }
            
            return null;
        }
    }

    public IEnumerable<string> Permissions => 
        User?.FindAll("permission").Select(c => c.Value) ?? Enumerable.Empty<string>();
    public int? InstitutionId
    {
        get
        {
            var institutionIdString = User?.FindFirstValue("institution_id");
            
            return int.TryParse(institutionIdString, out int parsedId) ? parsedId : null;
        }
    }
}


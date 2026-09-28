using Domain.Enums;

namespace Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(int userId, string name,string email, Role role,int? institutionId = null);
}
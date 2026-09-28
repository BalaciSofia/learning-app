using Domain.Enums;

namespace Application.Interfaces;

public interface ICurrentUserService
{
    int UserId { get; }
    string Email { get; }
    Role? Role { get; }
    IEnumerable<string> Permissions { get; }
    int? InstitutionId { get; }
    bool IsAuthenticated { get; }
}
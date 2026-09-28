using Domain.Enums;

namespace API.DTOs.UserDTO
{
    public record BasicUserResponse(
        int Id,
        string FirstName,
        string LastName,
        string Email,
        Role Role);
}

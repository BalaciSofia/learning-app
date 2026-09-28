using Domain.Enums;

namespace API.DTOs.UserDTO
{
    public record UserChangeRoleResponse(
        int Id,
        Role Role);
}
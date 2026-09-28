namespace API.DTOs.RegisterDTO
{
    public record RegisterResponse(
        int Id,
        string FirstName,
        string LastName,
        string Email);
}
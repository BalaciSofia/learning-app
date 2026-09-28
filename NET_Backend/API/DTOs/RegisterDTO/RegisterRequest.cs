namespace API.DTOs.RegisterDTO
{
    public record RegisterRequest(
        string FirstName,
        string LastName,
        int InstitutionId,
        string Email,
        string Password,
        string ConfirmPassword);
}
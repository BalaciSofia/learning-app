namespace API.DTOs.Profile;

public record UserProfileResponse(
    int Id,
    string Email,
    string Role,
    IEnumerable<string> Permissions,
    string FirstName,
    string LastName,
    string? InstitutionName);
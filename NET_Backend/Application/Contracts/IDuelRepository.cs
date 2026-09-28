using Domain.Entities;

namespace Application.Contracts
{
    public interface IDuelRepository
    {
        Task<List<User>> GetStudentsInInstitutionAsync(int institutionId, int excludeUserId);
        Task<Test?> GetTestByTitleAsync(string title);
        Task<DuelInvitation?> GetByIdAsync(int id);
        Task<DuelInvitation?> GetActiveInvitationAsync(int challengerId, int challengedId, int testId);
        Task<DuelInvitation?> GetByIdWithDetailsAsync(int id);
        Task AddInvitationAsync(DuelInvitation invitation);
        Task UpdateInvitationAsync(DuelInvitation invitation);
        Task<List<DuelInvitation>> GetIncomingInvitationsAsync(int userId);
        Task<List<DuelInvitation>> GetActiveDuelsAsync(int userId);
        Task<List<DuelInvitation>> GetHistoryAsync(int userId);
        Task AddResultAsync(DuelResult result);
    }
}

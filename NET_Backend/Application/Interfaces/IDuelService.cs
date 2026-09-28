using Domain.Entities;

namespace Application.Interfaces
{
    public interface IDuelService
    {
        Task<List<User>> GetChallengableStudentsAsync(User currentUser);
        Task<DuelInvitation?> SendInvitationAsync(User challenger, int challengedId, Test test);
        Task<DuelInvitation?> GetActiveInvitationAsync(int challengerId, int challengedId, int testId);
        Task<List<DuelInvitation>> GetIncomingInvitationsAsync(User user);
        Task<DuelInvitation?> GetInvitationByIdAsync(int duelId);
        Task<DuelInvitation?> AcceptInvitationAsync(int duelId, User user);
        Task<DuelInvitation?> RejectInvitationAsync(int duelId, User user);
        Task<(bool IsCompleted, DuelResult? Result)?> SaveResultAsync(int duelId, int correctAnswers, User currentUser);
        Task<List<DuelInvitation>> GetActiveDuelsAsync(User user);
        Task<List<DuelInvitation>> GetHistoryAsync(User user);
    }
}

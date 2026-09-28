using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;

namespace Application.UseCases
{
    public class DuelService : IDuelService
    {
        private readonly IDuelRepository _duelRepository;

        public DuelService(IDuelRepository duelRepository)
        {
            _duelRepository = duelRepository;
        }

        public Task<List<User>> GetChallengableStudentsAsync(User currentUser)
        {
            return _duelRepository.GetStudentsInInstitutionAsync(currentUser.InstitutionId, currentUser.Id);
        }

        public Task<DuelInvitation?> GetActiveInvitationAsync(int challengerId, int challengedId, int testId)
        {
            return _duelRepository.GetActiveInvitationAsync(challengerId, challengedId, testId);
        }

        public async Task<DuelInvitation?> SendInvitationAsync(User challenger, int challengedId, Test test)
        {
            var invitation = new DuelInvitation
            {
                ChallengerId = challenger.Id,
                Challenger = challenger,
                ChallengedId = challengedId,
                TestId = test.Id,
                TestTitle = test.Title,
                Status = InvitationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _duelRepository.AddInvitationAsync(invitation);
            return invitation;
        }

        public Task<List<DuelInvitation>> GetIncomingInvitationsAsync(User user)
        {
            return _duelRepository.GetIncomingInvitationsAsync(user.Id);
        }

        public Task<DuelInvitation?> GetInvitationByIdAsync(int duelId)
        {
            return _duelRepository.GetByIdAsync(duelId);
        }

        public async Task<DuelInvitation?> AcceptInvitationAsync(int duelId, User user)
        {
            var invitation = await _duelRepository.GetByIdAsync(duelId);
            if (invitation is null)
                return null;

            invitation.Status = InvitationStatus.Accepted;
            await _duelRepository.UpdateInvitationAsync(invitation);
            return invitation;
        }

        public async Task<DuelInvitation?> RejectInvitationAsync(int duelId, User user)
        {
            var invitation = await _duelRepository.GetByIdAsync(duelId);
            if (invitation is null)
                return null;

            invitation.Status = InvitationStatus.Rejected;
            await _duelRepository.UpdateInvitationAsync(invitation);
            return invitation;
        }

        public async Task<(bool IsCompleted, DuelResult? Result)?> SaveResultAsync(int duelId, int correctAnswers, User currentUser)
        {
            var invitation = await _duelRepository.GetByIdWithDetailsAsync(duelId);
            if (invitation is null)
                return null;

            if (currentUser.Id == invitation.ChallengerId)
            {
                invitation.ChallengerScore = correctAnswers;
            }
            else if (currentUser.Id == invitation.ChallengedId)
            {
                invitation.ChallengedScore = correctAnswers;
            }
            else
            {
                return null;
            }

            if (invitation.ChallengerScore.HasValue && invitation.ChallengedScore.HasValue)
            {
                int challengerScore = invitation.ChallengerScore.Value;
                int challengedScore = invitation.ChallengedScore.Value;

                bool isDraw = challengerScore == challengedScore;
                int? winnerId = isDraw
                    ? null
                    : (challengerScore > challengedScore ? invitation.ChallengerId : invitation.ChallengedId);

                User? winnerUser = isDraw
                    ? null
                    : (winnerId == invitation.ChallengerId ? invitation.Challenger : invitation.Challenged);

                var result = new DuelResult
                {
                    DuelInvitationId = duelId,
                    WinnerId = winnerId,
                    Winner = winnerUser,
                    ChallengerCorrectAnswers = challengerScore,
                    ChallengedCorrectAnswers = challengedScore,
                    IsDraw = isDraw,
                    CompletedAt = DateTime.UtcNow
                };

                invitation.Status = InvitationStatus.Completed;
                await _duelRepository.UpdateInvitationAsync(invitation);
                await _duelRepository.AddResultAsync(result);
                return (IsCompleted: true, Result: result);
            }
            else
            {
                await _duelRepository.UpdateInvitationAsync(invitation);
                return (IsCompleted: false, Result: null);
            }
        }

        public Task<List<DuelInvitation>> GetActiveDuelsAsync(User user)
        {
            return _duelRepository.GetActiveDuelsAsync(user.Id);
        }

        public Task<List<DuelInvitation>> GetHistoryAsync(User user)
        {
            return _duelRepository.GetHistoryAsync(user.Id);
        }
    }
}

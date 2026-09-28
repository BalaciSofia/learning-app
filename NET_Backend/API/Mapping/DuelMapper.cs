using API.DTOs.DuelDTO;
using Domain.Entities;
using Domain.Enums;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class DuelMapper
    {
        [MapperIgnoreSource(nameof(User.PasswordHash))]
        [MapperIgnoreSource(nameof(User.Institution))]
        [MapperIgnoreSource(nameof(User.InstitutionId))]
        [MapperIgnoreSource(nameof(User.Role))]
        public partial StudentSummaryResponse ToStudentSummary(User user);

        public partial List<StudentSummaryResponse> ToStudentSummaries(List<User> users);

        [MapProperty(nameof(DuelInvitation.Challenger), nameof(DuelInvitationResponse.ChallengerName))]
        [MapProperty(nameof(DuelInvitation.Challenged), nameof(DuelInvitationResponse.ChallengedName))]
        [MapperIgnoreSource(nameof(DuelInvitation.Test))]
        [MapperIgnoreSource(nameof(DuelInvitation.Result))]
        public partial DuelInvitationResponse ToInvitationResponse(DuelInvitation invitation);

        public partial List<DuelInvitationResponse> ToInvitationResponses(List<DuelInvitation> invitations);

        [MapProperty(nameof(DuelResult.DuelInvitationId), nameof(DuelResultResponse.DuelId))]
        [MapProperty(nameof(DuelResult.Winner), nameof(DuelResultResponse.WinnerName))]
        [MapperIgnoreSource(nameof(DuelResult.Id))]
        [MapperIgnoreSource(nameof(DuelResult.DuelInvitation))]
        public partial DuelResultResponse ToResultResponse(DuelResult result);

        public DuelHistoryResponse ToHistoryResponse(DuelInvitation invitation)
        {
            string? winnerName = null;
            if (invitation.Result is not null && !invitation.Result.IsDraw && invitation.Result.Winner is not null)
                winnerName = MapFullName(invitation.Result.Winner);

            return new DuelHistoryResponse
            {
                DuelId = invitation.Id,
                ChallengerName = MapFullName(invitation.Challenger),
                ChallengedName = MapFullName(invitation.Challenged),
                TestTitle = invitation.TestTitle,
                ChallengerCorrectAnswers = invitation.Result?.ChallengerCorrectAnswers ?? 0,
                ChallengedCorrectAnswers = invitation.Result?.ChallengedCorrectAnswers ?? 0,
                WinnerId = invitation.Result?.WinnerId,
                WinnerName = winnerName,
                IsDraw = invitation.Result?.IsDraw ?? false,
                CompletedAt = invitation.Result?.CompletedAt ?? invitation.CreatedAt
            };
        }

        public partial List<DuelHistoryResponse> ToHistoryResponses(List<DuelInvitation> invitations);

        private string MapFullName(User user) => 
            user is null ? "Unknown" : $"{user.FirstName} {user.LastName}";

        private string? MapOptionalFullName(User? user) =>
            user is null ? null : $"{user.FirstName} {user.LastName}";

        private string MapStatus(InvitationStatus status) => status.ToString();
    }
}

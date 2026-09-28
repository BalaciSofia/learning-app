using Application.Common.Results;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IStudentProfileService
    {
        Task<(StudentProfile Profile, User User)?> GetProfileAsync(int userId, int courseId);
        Task<DailyPuzzleResult?> GetDailyPuzzleAsync(int userId, int courseId);
        Task<AnswerDailyPuzzleResult?> AnswerDailyPuzzleAsync(int userId, int courseId, int answerIndex);
        Task<ShareProgressResult?> ShareProgressAsync(int userId, int courseId);
    }
}

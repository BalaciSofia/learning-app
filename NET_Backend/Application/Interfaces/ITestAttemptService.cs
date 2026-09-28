using Domain.Entities;

namespace Application.Interfaces
{
    public interface ITestAttemptService
    {
        Task<TestAttempt?> StartAttemptAsync(int testId, int studentId);
        Task<TestAttemptAnswer?> SubmitAnswerAsync(int testId, int attemptId, int answerId, int studentId);
        Task<List<TestAttempt>> GetAttemptsAsync(int testId, int currentUserId, bool isTeacher);
        Task<TestAttempt?> GetAttemptDetailsAsync(int testId, int attemptId, int currentUserId, bool isTeacher);
        Task<TestAttempt?> SubmitAttemptAsync(int testId, int attemptId, int studentId);
        Task<HashSet<int>> GetAttemptedTestIdsAsync(int studentId);
    }
}
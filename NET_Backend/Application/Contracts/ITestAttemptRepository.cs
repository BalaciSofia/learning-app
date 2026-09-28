using Domain.Entities;

namespace Application.Contracts
{
    public interface ITestAttemptRepository
    {
        Task<Test?> GetTestWithQuestionsAndAnswersAsync(int testId);
        Task<Answer?> GetAnswerWithQuestionAsync(int answerId);
        Task<TestAttempt?> GetAttemptByIdAsync(int attemptId);
        Task<TestAttempt?> GetAttemptWithAnswersAsync(int testId, int attemptId);
        Task<List<TestAttempt>> GetAttemptsByTestIdAsync(int testId);
        Task<List<TestAttempt>> GetAttemptsByTestAndStudentAsync(int testId, int studentId);
        Task<List<int>> GetAttemptedTestIdsByStudentAsync(int studentId);
        Task<List<TestAttempt>> GetSubmittedAttemptsWithAnswersByTestIdAsync(int testId);
        Task AddAttemptAsync(TestAttempt attempt);
        Task AddAttemptAnswerAsync(TestAttemptAnswer attemptAnswer);
        Task UpdateAttemptAsync(TestAttempt attempt);

    }
}
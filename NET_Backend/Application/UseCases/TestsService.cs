using Application.Contracts;
using Application.Interfaces;
using Application.Common.Results;
using Domain.Entities;
using Domain.Enums;

namespace Application.UseCases
{
    public class TestsService : ITestsService
    {
        private readonly ITestsRepository _testsRepository;
        private readonly ITestAttemptRepository _testAttemptRepository;

        public TestsService(ITestsRepository testsRepository, ITestAttemptRepository testAttemptRepository)
        {
            _testsRepository = testsRepository;
            _testAttemptRepository = testAttemptRepository;
        }

        public async Task<Test> CreateTestAsync(Test test)
        {
            return await _testsRepository.AddTestAsync(test);
        }

        public async Task<bool> DeleteTestAsync(int testId)
        {
            return await _testsRepository.DeleteAsync(testId);
        }

        public async Task<Test?> GetTestByIdAsync(int id)
        {
            Test? test = await _testsRepository.GetByIdAsync(id);
            if (test is null)
            {
                return null;
            }

            test.Questions = test.Questions.OrderBy(q => Random.Shared.Next()).ToList();

            foreach (var question in test.Questions)
            {
                question.Answers = question.Answers.OrderBy(a => Random.Shared.Next()).ToList();
            }

            return test;
        }

        public async Task<IEnumerable<Test>> GetTestsForUserAsync(int userId, Role role)
        {
            return role switch
            {
                Role.Teacher => await _testsRepository.GetAllByCreatorIdAsync(userId),
                Role.Admin => await _testsRepository.GetAllAsync(),
                _ => await _testsRepository.GetPublishedAsync()
            };
        }

        public async Task<Test?> UpdateTestAsync(Test test)
        {
            return await _testsRepository.ReplaceAsync(test);
        }

        public async Task<Test?> PublishTestAsync(int testId)
        {
            return await _testsRepository.PublishAsync(testId);
        }

        public async Task<TestStatsResult?> GetTestStatsAsync(int testId)
        {
            Test? test = await _testsRepository.GetByIdAsync(testId);
            if (test is null)
            {
                return null;
            }

            List<TestAttempt> attempts = await _testAttemptRepository
                .GetSubmittedAttemptsWithAnswersByTestIdAsync(testId);

            int attemptCount = attempts.Count;

            if (attemptCount == 0)
            {
                return new TestStatsResult(
                    AttemptCount: 0,
                    AverageScore: null,
                    HighScore: null,
                    LowScore: null,
                    QuestionBreakdown: new List<QuestionStatsResult>());
            }

            List<decimal> scorePercentages = attempts
                .Select(CalculateAttemptScorePercentage)
                .ToList();

            List<QuestionStatsResult> questionBreakdown = test.Questions
                .OrderBy(question => question.Id)
                .Select(question => CreateQuestionStats(question, attempts, attemptCount))
                .ToList();

            return new TestStatsResult(
                AttemptCount: attemptCount,
                AverageScore: RoundPercentage(scorePercentages.Average()),
                HighScore: RoundPercentage(scorePercentages.Max()),
                LowScore: RoundPercentage(scorePercentages.Min()),
                QuestionBreakdown: questionBreakdown);
        }


        private static QuestionStatsResult CreateQuestionStats(Question question,List<TestAttempt> attempts,int attemptCount)
        {
            int fullyCorrectAttemptCount = attempts.Count(
                attempt => IsQuestionFullyCorrect(attempt, question.Id));

            decimal correctRate = RoundPercentage(
                (decimal)fullyCorrectAttemptCount / attemptCount * 100);

            return new QuestionStatsResult(
                QuestionId: question.Id,
                Text: question.Text,
                CorrectRate: correctRate);
        }

        private static bool IsQuestionFullyCorrect(TestAttempt attempt, int questionId)
        {
            decimal questionScore = attempt.Answers
                .Where(answer => answer.QuestionId == questionId)
                .Sum(answer => answer.PointsAwarded);

            return questionScore >= 1;
        }

        private static decimal CalculateAttemptScorePercentage(TestAttempt attempt)
        {
            if (attempt.MaxScore <= 0)
            {
                return 0;
            }

            return attempt.Score / attempt.MaxScore * 100;
        }

        private static decimal RoundPercentage(decimal value)
        {
            return Math.Round(value, 2);
        }
    }
}

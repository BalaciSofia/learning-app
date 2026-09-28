using Application.Contracts;
using Application.Helper.IHelper;
using Application.Interfaces;
using Domain.Entities;

namespace Application.UseCases
{
    public class TestAttemptService : ITestAttemptService
    {
        private readonly ITestAttemptRepository _testAttemptRepository;
        private readonly IScoreCalculator _scoreCalculator;

        public TestAttemptService(ITestAttemptRepository testAttemptRepository, IScoreCalculator scoreCalculator)
        {
            _testAttemptRepository = testAttemptRepository;
            _scoreCalculator = scoreCalculator;
        }

        public async Task<TestAttempt?> StartAttemptAsync(int testId, int studentId)
        {
            var test = await _testAttemptRepository.GetTestWithQuestionsAndAnswersAsync(testId);

            if(test is null || !test.IsPublished)
                return null;

            if(!test.IsRetakeAllowed)
            {
                var existingAttempts = await _testAttemptRepository.GetAttemptsByTestAndStudentAsync(testId, studentId);
                if(existingAttempts.Count > 0)
                    throw new InvalidOperationException("You have already attempted this test and retakes are not allowed.");
            }

            var attempt = new TestAttempt
            {
                TestId = test.Id,
                StudentId = studentId,
                TestTitle = test.Title,
                Score = 0,
                MaxScore = test.Questions.Count,
                CorrectAnswers = 0,
                TotalQuestions = test.Questions.Count,
                StartedAt = DateTime.UtcNow,
                SubmittedAt = null,
                IsSubmitted = false
            };

            await _testAttemptRepository.AddAttemptAsync(attempt);

            return attempt;
        }

        public async Task<TestAttemptAnswer?> SubmitAnswerAsync(int testId, int attemptId, int answerId, int studentId)
        {
            var attempt = await _testAttemptRepository.GetAttemptWithAnswersAsync(testId, attemptId);

            if(attempt == null)
                return null;

            if(attempt.StudentId != studentId)
                throw new UnauthorizedAccessException("You can't submit answers for another student's attempt.");

            if(attempt.IsSubmitted)
                throw new InvalidOperationException("This attempt has already been submitted.");

            var test = await _testAttemptRepository.GetTestWithQuestionsAndAnswersAsync(testId);

            if(test == null)
                return null;

            var answer = await _testAttemptRepository.GetAnswerWithQuestionAsync(answerId);

            if(answer == null)
                return null;

            if(answer.Question.TestId != testId)
                throw new InvalidOperationException("This answer does not belong to the selected test.");

            var question = test.Questions.FirstOrDefault(q => q.Id == answer.QuestionId);

            if(question == null)
                return null;

            bool isMultipleChoice = _scoreCalculator.IsMultipleChoice(question.Type);

            if(!isMultipleChoice && attempt.Answers.Any(a => a.QuestionId == question.Id))
                throw new InvalidOperationException("This question already has an answer.");

            if(attempt.Answers.Any(a => a.AnswerId == answerId))
                throw new InvalidOperationException("This answer was already submitted.");

            var attemptAnswer = new TestAttemptAnswer
            {
                TestAttemptId = attemptId,
                QuestionId = question.Id,
                AnswerId = answer.Id,
                QuestionText = question.Text,
                QuestionType = question.Type,
                AnswerText = answer.Text,
                IsCorrect = answer.IsCorrect,
                PointsAwarded = 0
            };

            await _testAttemptRepository.AddAttemptAnswerAsync(attemptAnswer);
            attempt.Answers.Add(attemptAnswer);
            _scoreCalculator.RecalculateScore(attempt, test);
            await _testAttemptRepository.UpdateAttemptAsync(attempt);

            return attemptAnswer;
        }

        public async Task<List<TestAttempt>> GetAttemptsAsync(int testId, int currentUserId, bool isTeacher)
        {
            var attempts = await _testAttemptRepository.GetAttemptsByTestIdAsync(testId);

            if(isTeacher)
                return attempts;

            return attempts.Where(a => a.StudentId == currentUserId).ToList();
        }

        public async Task<TestAttempt?> GetAttemptDetailsAsync(int testId, int attemptId, int currentUserId, bool isTeacher)
        {
            var attempt = await _testAttemptRepository.GetAttemptWithAnswersAsync(testId, attemptId);

            if(attempt == null)
                return null;

            if(!isTeacher && attempt.StudentId != currentUserId)
                throw new UnauthorizedAccessException("You can't view another student's attempt.");

            if(!isTeacher && !attempt.IsSubmitted)
                throw new InvalidOperationException("Attempt is not submitted yet.");

            return attempt;
        }

        public async Task<TestAttempt?> SubmitAttemptAsync(int testId, int attemptId, int studentId)
        {
            var attempt = await _testAttemptRepository.GetAttemptWithAnswersAsync(testId, attemptId);

            if(attempt == null)
                return null;

            if(attempt.StudentId != studentId)
                throw new UnauthorizedAccessException("You can't submit another student's attempt.");

            if(attempt.IsSubmitted)
                throw new InvalidOperationException("This attempt has already been submitted.");

            var test = await _testAttemptRepository.GetTestWithQuestionsAndAnswersAsync(testId);

            if(test == null)
                return null;

            _scoreCalculator.RecalculateScore(attempt, test);
            attempt.IsSubmitted = true;
            attempt.SubmittedAt = DateTime.UtcNow;
            await _testAttemptRepository.UpdateAttemptAsync(attempt);

            return attempt;
        }

        public async Task<HashSet<int>> GetAttemptedTestIdsAsync(int studentId)
        {
            var testIds = await _testAttemptRepository.GetAttemptedTestIdsByStudentAsync(studentId);
            return testIds.ToHashSet();
        }
    }
}
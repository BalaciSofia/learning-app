using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class TestAttemptRepository : ITestAttemptRepository
    {
        private readonly LearningAppDbContext _context;

        public TestAttemptRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Test?> GetTestWithQuestionsAndAnswersAsync(int testId)
        {
            return await _context.Tests.Include(t => t.Questions).ThenInclude(q => q.Answers).FirstOrDefaultAsync(t => t.Id == testId);
        }

        public async Task<Answer?> GetAnswerWithQuestionAsync(int answerId)
        {
            return await _context.Answers.Include(a => a.Question).FirstOrDefaultAsync(a => a.Id == answerId);
        }

        public async Task<TestAttempt?> GetAttemptByIdAsync(int attemptId)
        {
            return await _context.TestAttempts.FirstOrDefaultAsync(ta => ta.Id == attemptId);
        }

        public async Task<TestAttempt?> GetAttemptWithAnswersAsync(int testId, int attemptId)
        {
            return await _context.TestAttempts
                .Include(ta => ta.Answers)
                    .ThenInclude(taa => taa.Question)
                        .ThenInclude(q => q.Answers)
                .Include(ta => ta.Answers)
                    .ThenInclude(taa => taa.Answer)
                .Include(ta => ta.Student)
                .FirstOrDefaultAsync(ta => ta.Id == attemptId && ta.TestId == testId);
        }

        public async Task<List<TestAttempt>> GetAttemptsByTestIdAsync(int testId)
        {
            return await _context.TestAttempts.Include(ta => ta.Student).Where(ta => ta.TestId == testId).OrderByDescending(ta => ta.StartedAt).ToListAsync();
        }

        public async Task<List<TestAttempt>> GetAttemptsByTestAndStudentAsync(int testId, int studentId)
        {
            return await _context.TestAttempts
                .Where(ta => ta.TestId == testId && ta.StudentId == studentId)
                .ToListAsync();
        }

        public async Task<List<int>> GetAttemptedTestIdsByStudentAsync(int studentId)
        {
            return await _context.TestAttempts
                .Where(ta => ta.StudentId == studentId)
                .Select(ta => ta.TestId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<List<TestAttempt>> GetSubmittedAttemptsWithAnswersByTestIdAsync(int testId)
        {
            return await _context.TestAttempts
                .AsNoTracking()
                .Include(ta => ta.Answers)
                .Where(ta => ta.TestId == testId && ta.IsSubmitted)
                .ToListAsync();
        }


        public async Task AddAttemptAsync(TestAttempt attempt)
        {
            await _context.TestAttempts.AddAsync(attempt);
            await _context.SaveChangesAsync();
        }

        public async Task AddAttemptAnswerAsync(TestAttemptAnswer attemptAnswer)
        {
            await _context.TestAttemptAnswers.AddAsync(attemptAnswer);
        }

        public async Task UpdateAttemptAsync(TestAttempt attempt)
        {
            _context.TestAttempts.Update(attempt);
            await _context.SaveChangesAsync();
        }
    }
}
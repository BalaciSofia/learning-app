using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class TestsRepository : ITestsRepository
    {
        private readonly LearningAppDbContext _context;

        public TestsRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task<Test> AddTestAsync(Test test)
        {
            await _context.Tests.AddAsync(test);
            await _context.SaveChangesAsync();
            return test;
        }

        public async Task<Test?> GetByIdAsync(int id)
        {
            return await _context.Tests
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Test>> GetAllByCreatorIdAsync(int creatorId)
        {
            return await _context.Tests
                .Include(t => t.Questions)
                .Where(t => t.CreatorId == creatorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Test>> GetAllAsync()
        {
            return await _context.Tests
                .Include(t => t.Questions)
                .ToListAsync();
        }

        public async Task<IEnumerable<Test>> GetPublishedAsync()
        {
            return await _context.Tests
                .Include(t => t.Questions)
                .Where(t => t.IsPublished)
                .ToListAsync();
        }

        public async Task<Test?> ReplaceAsync(Test test)
        {
            var existing = await _context.Tests
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(t => t.Id == test.Id);

            if (existing is null)
            {
                return null;
            }

            existing.Title = test.Title;
            existing.Description = test.Description;
            existing.IsRetakeAllowed = test.IsRetakeAllowed;

            foreach (var existingQuestion in existing.Questions.ToList())
            {
                var stillPresent = test.Questions.Any(q => q.Id != 0 && q.Id == existingQuestion.Id);
                if (!stillPresent)
                {
                    _context.Questions.Remove(existingQuestion);
                }
            }

            foreach (var incomingQuestion in test.Questions)
            {
                var existingQuestion = incomingQuestion.Id != 0
                    ? existing.Questions.FirstOrDefault(q => q.Id == incomingQuestion.Id)
                    : null;

                if (existingQuestion is null)
                {
                    incomingQuestion.TestId = existing.Id;
                    existing.Questions.Add(incomingQuestion);
                    continue;
                }

                _context.Entry(existingQuestion).CurrentValues.SetValues(incomingQuestion);
                existingQuestion.TestId = existing.Id;

                foreach (var existingAnswer in existingQuestion.Answers.ToList())
                {
                    var answerStillPresent = incomingQuestion.Answers.Any(a => a.Id != 0 && a.Id == existingAnswer.Id);
                    if (!answerStillPresent)
                    {
                        _context.Answers.Remove(existingAnswer);
                    }
                }

                foreach (var incomingAnswer in incomingQuestion.Answers)
                {
                    var existingAnswer = incomingAnswer.Id != 0
                        ? existingQuestion.Answers.FirstOrDefault(a => a.Id == incomingAnswer.Id)
                        : null;

                    if (existingAnswer is null)
                    {
                        incomingAnswer.QuestionId = existingQuestion.Id;
                        existingQuestion.Answers.Add(incomingAnswer);
                    }
                    else
                    {
                        _context.Entry(existingAnswer).CurrentValues.SetValues(incomingAnswer);
                        existingAnswer.QuestionId = existingQuestion.Id;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<Test?> PublishAsync(int id)
        {
            var test = await _context.Tests
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(t => t.Id == id);

            if(test is null)
            {
                return null;
            }

            test.IsPublished = true;
            await _context.SaveChangesAsync();
            return test;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var test = await _context.Tests
                .Include(t => t.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (test is null)
            {
                return false;
            }

            var attempts = await _context.TestAttempts
                .Include(ta => ta.Answers)
                .Where(ta => ta.TestId == id)
                .ToListAsync();

            foreach (var attempt in attempts)
            {
                _context.TestAttemptAnswers.RemoveRange(attempt.Answers);
            }
            _context.TestAttempts.RemoveRange(attempts);

            var duels = await _context.DuelInvitations
                .Include(d => d.Result)
                .Where(d => d.TestId == id)
                .ToListAsync();

            foreach (var duel in duels)
            {
                if (duel.Result != null)
                {
                    _context.DuelResults.Remove(duel.Result);
                }
            }
            _context.DuelInvitations.RemoveRange(duels);

            foreach (var question in test.Questions)
            {
                _context.Answers.RemoveRange(question.Answers);
            }
            _context.Questions.RemoveRange(test.Questions);

            _context.Tests.Remove(test);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

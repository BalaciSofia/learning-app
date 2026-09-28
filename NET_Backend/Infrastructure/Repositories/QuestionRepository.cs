using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly LearningAppDbContext _context;

        public QuestionRepository(LearningAppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Question question)
        {
            await _context.Questions.AddAsync(question);
        }

        public async Task<int> CountByTestIdAsync(int testId)
        {
            return await _context.Questions.CountAsync(q => q.TestId == testId);
        }

        public async Task<Question?> GetByIdAsync(int id, int testId)
        {
            return await _context.Questions
                .Include(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id && q.TestId == testId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Question question)
        {
            _context.Questions.Update(question);
        }
        public async Task DeleteAsync(Question question) { 
            _context.Questions.Remove(question);
        }

        public Task<Question?> GetQuestionByIdAsync(int questionId)
        {
            return _context.Questions.Include(m=>m.Answers).FirstOrDefaultAsync(q => q.Id == questionId);
        }
    }
}

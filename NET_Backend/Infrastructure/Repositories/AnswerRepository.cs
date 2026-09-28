using Application.Contracts;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class AnswerRepository : IAnswerRepository
    {
        private readonly LearningAppDbContext _context;

        public AnswerRepository(LearningAppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Answer answer)
        {
            await _context.Answers.AddAsync(answer);
        }

        public async Task<int> CountByQuestionIdAsync(int questionId)
        {
            return await _context.Answers.CountAsync(a => a.QuestionId == questionId);
        }

        public async Task DeleteAsync(Answer answer)
        {
            _context.Answers.Remove(answer);
        }

        public async Task<Answer?> GetByIdAsync( int answerId,int questionId)
        {
            return await _context.Answers.FirstOrDefaultAsync(a => a.Id == answerId && a.QuestionId == questionId);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Answer answer)
        {
             _context.Answers.Update(answer);
        }
    }
}

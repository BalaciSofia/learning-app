using Domain.Entities;

namespace Application.Contracts
{
    public interface IAnswerRepository
    {
        Task AddAsync(Answer answer);
        Task<Answer?> GetByIdAsync(int answerId, int questionId);
        Task<int> CountByQuestionIdAsync(int questionId);
        Task SaveChangesAsync();
        Task UpdateAsync(Answer answer);
        Task DeleteAsync(Answer answer);
    }
}

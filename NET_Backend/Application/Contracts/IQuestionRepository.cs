using Domain.Entities;

namespace Application.Contracts
{
    public interface IQuestionRepository
    {
        Task AddAsync(Question question);
        Task<Question?> GetByIdAsync(int id, int testId);
        Task<int> CountByTestIdAsync(int testId);
        Task SaveChangesAsync();
        Task UpdateAsync(Question question);
        Task DeleteAsync(Question question);
        Task<Question?> GetQuestionByIdAsync( int questionId);
    }
}

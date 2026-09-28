using Domain.Entities;

namespace Application.Interfaces
{
    public interface IAnswerService
    {
        Task<Answer?> AddAnswerAsync(int testId, int questionId, Answer answer);
        Task<Answer?> UpdateAnswerAsync(int testId, int questionId, int answerId, Answer answer);
        Task<bool> DeleteAnswerAsync(int testId, int questionId, int answerId);
        
        Task<Answer?> GetAnswerAsync(int questionId, int answerId);
    }
}
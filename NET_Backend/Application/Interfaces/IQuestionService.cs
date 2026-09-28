using Domain.Entities;

namespace Application.Interfaces
{
    public interface IQuestionService
    {
        Task<Question> AddQuestionAsync(int testId, Question question);
        Task<Question?> UpdateQuestionAsync(int testId, int questionId, Question question);
        Task<bool> DeleteQuestionAsync(int testId, int questionId);

        public Task<Question?> GetQuestionByIdAsync(int questionId);
        public Task<bool> AnswerQuestionAsync(int questionId, List<Answer> answer);
    }
}
using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;

namespace Application.UseCases
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository _questionRepository;

        public QuestionService(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
        }

        public async Task<Question> AddQuestionAsync(int testId, Question question)
        {
            question.TestId = testId;
            await _questionRepository.AddAsync(question);
            await _questionRepository.SaveChangesAsync();
            return question;
        }

        public async Task<Question?> UpdateQuestionAsync(int testId, int questionId, Question question)
        {
            var existing = await _questionRepository.GetByIdAsync(questionId, testId);

            if (existing == null)
                return null; 
            if (existing.Type == "multiple" && question.Type == "single")
            {
                var hasCorrectAnswer = existing.Answers.Any(a => a.IsCorrect);
                if (!hasCorrectAnswer)
                    throw new Exception("Single type question must have at least one correct answer");
            }
            existing.Text = question.Text;
            existing.Type = question.Type;

            await _questionRepository.UpdateAsync(existing);
            await _questionRepository.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteQuestionAsync(int testId, int questionId)
        {
            var question = await _questionRepository.GetByIdAsync(questionId, testId);

            if (question == null)
                return false; 

            var count = await _questionRepository.CountByTestIdAsync(testId);

            if (count == 1)
                throw new Exception("Cannot delete last question"); 

            await _questionRepository.DeleteAsync(question);
            await _questionRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AnswerQuestionAsync(int questionId, List<Answer> answer)
        {
            var question = await _questionRepository.GetQuestionByIdAsync(questionId);
            if (question != null)
            {
                var answers = question.Answers;
                foreach (var a in answer)
                {
                    if(!answers.Contains(a))
                        return false;
                }
                if (answer.All(a => a.IsCorrect))
                {
                    return true;
                }
            }
            return false;
        }

        public Task<Question?> GetQuestionByIdAsync(int questionId)
        {
            return _questionRepository.GetQuestionByIdAsync(questionId);
        }
    }
}
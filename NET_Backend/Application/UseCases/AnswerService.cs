using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;

namespace Application.UseCases
{
    public class AnswerService : IAnswerService
    {
        private readonly IAnswerRepository _answerRepository;
        private readonly IQuestionRepository _questionRepository;

        public AnswerService(IAnswerRepository answerRepository, IQuestionRepository questionRepository)
        {
            _answerRepository = answerRepository;
            _questionRepository = questionRepository;
        }
        public async Task<Answer?> AddAnswerAsync(int testId, int questionId, Answer answer)
        {
            var question = await _questionRepository.GetByIdAsync(questionId, testId);
            if (question == null)
                return null; 

            var count = await _answerRepository.CountByQuestionIdAsync(questionId);
            if (count >= 6)
                throw new Exception("Maximum 6 answers allowed"); 

            answer.QuestionId = questionId;
            await _answerRepository.AddAsync(answer);
            await _answerRepository.SaveChangesAsync();
            return answer;
        }

        public async Task<Answer?> GetAnswerAsync(int questionId,int answerId)
        {
            return await _answerRepository.GetByIdAsync( questionId,answerId);
        }
        public async Task<bool> DeleteAnswerAsync(int testId, int questionId, int answerId)
        {
            var question = await _questionRepository.GetByIdAsync(questionId, testId);
            if (question == null)
                return false; 
            var ans = await _answerRepository.GetByIdAsync(answerId, questionId);
            if (ans == null)
                return false; 
            var count = await _answerRepository.CountByQuestionIdAsync(questionId);
            if (count <= 2)
                throw new Exception("Minimum 2 answers required");
            await _answerRepository.DeleteAsync(ans);
            await _answerRepository.SaveChangesAsync();
            return true;
        }

        public async Task<Answer?> UpdateAnswerAsync(int testId, int questionId, int answerId, Answer answer)
        {
            var question = await _questionRepository.GetByIdAsync(questionId, testId);
            if (question == null)
                return null;
            var ans = await _answerRepository.GetByIdAsync(answerId, questionId);
            if (ans == null)
                return null;
            if (answer.IsCorrect && question.Type == "single")
            {
                var hasCorrectAnswer = question.Answers
                    .Any(a => a.IsCorrect && a.Id != answerId);

                if (hasCorrectAnswer)
                    throw new Exception("Single type question can only have one correct answer");
            }
            ans.Text = answer.Text;
            ans.IsCorrect = answer.IsCorrect;

            await _answerRepository.UpdateAsync(ans);
            await _answerRepository.SaveChangesAsync();
            return ans;
        }
    }
}

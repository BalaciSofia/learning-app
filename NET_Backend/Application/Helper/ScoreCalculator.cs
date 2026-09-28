using Application.Common.Constants;
using Application.Helper.IHelper;
using Domain.Entities;

namespace Application.Helper
{
    public class ScoreCalculator : IScoreCalculator
    {
        public void RecalculateScore(TestAttempt attempt, Test test)
        {
            decimal score = 0;
            int correctQuestions = 0;

            foreach(var question in test.Questions)
            {
                var selectedAnswers = attempt.Answers.Where(a => a.QuestionId == question.Id).ToList();
           
                if(!selectedAnswers.Any())
                    continue;

                decimal questionScore = CalculateQuestionScore(question, selectedAnswers);

                foreach(var selectedAnswer in selectedAnswers)
                {
                    selectedAnswer.PointsAwarded = questionScore == 0 ? 0 : questionScore / selectedAnswers.Count;
                }

                score += questionScore;

                if(questionScore == 1)
                    correctQuestions++;
            }

            attempt.Score = score;
            attempt.MaxScore = test.Questions.Count;
            attempt.CorrectAnswers = correctQuestions;
            attempt.TotalQuestions = test.Questions.Count;
            
        }

        public bool IsMultipleChoice(string questionType)
        {
            var normalizedQuestionType = questionType?.Trim().ToLowerInvariant();

            return normalizedQuestionType == "multiple" || normalizedQuestionType == "multiple choice";
        }

        private decimal CalculateQuestionScore(Question question, List<TestAttemptAnswer> selectedAnswers)
        {
            var correctAnswerIds = question.Answers.Where(a => a.IsCorrect).Select(a => a.Id).ToList();
            var selectedAnswerIds = selectedAnswers.Select(a => a.AnswerId).Distinct().ToList();
        
            if(!correctAnswerIds.Any())
                return 0;

            if(!IsMultipleChoice(question.Type))
            {
                return selectedAnswerIds.Count == 1 && correctAnswerIds.Contains(selectedAnswerIds[0]) ? 1:0;
            }

            bool hasWrongAnswer = selectedAnswerIds.Any(id => !correctAnswerIds.Contains(id));

            if(hasWrongAnswer)
                return 0;

            int selectedCorrectCount = selectedAnswerIds.Count(id => correctAnswerIds.Contains(id));
        
            return (decimal)selectedCorrectCount / correctAnswerIds.Count;
        }
    }
}
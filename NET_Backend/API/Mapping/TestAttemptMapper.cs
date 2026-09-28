using API.DTOs.TestAttemptDTO;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class TestAttemptMapper
    {
        [MapProperty(nameof(TestAttempt.Id), nameof(StartAttemptResponseDto.AttemptId))]
        public partial StartAttemptResponseDto ToStartAttemptResponse(TestAttempt attempt);

        [MapperIgnoreTarget(nameof(SubmitAttemptResponseDto.Message))]
        [MapProperty(nameof(TestAttemptAnswer.TestAttemptId), nameof(SubmitAttemptResponseDto.AttemptId))]
        public partial SubmitAttemptResponseDto ToSubmitAttemptResponse(TestAttemptAnswer attemptAnswer);

        [MapProperty(nameof(TestAttempt.Id), nameof(AttemptSummaryResponseDto.AttemptId))]
        public partial AttemptSummaryResponseDto ToSummaryResponse(TestAttempt attempt);

        public partial List<AttemptSummaryResponseDto> ToSummaryResponses(List<TestAttempt> attempts);

        public AttemptDetailsResponseDto ToDetailsResponse(TestAttempt attempt)
        {
            return new AttemptDetailsResponseDto
            {
                AttemptId = attempt.Id,
                TestId = attempt.TestId,
                StudentId = attempt.StudentId,
                TestTitle = attempt.TestTitle,
                Score = attempt.Score,
                MaxScore = attempt.MaxScore,
                CorrectAnswers = attempt.CorrectAnswers,
                TotalQuestions = attempt.TotalQuestions,
                Answers = attempt.Answers.Select(ToFeedbackResponse).ToList()
            };
        }

        private AttemptFeedbackDto ToFeedbackResponse(TestAttemptAnswer attemptAnswer)
        {
            return new AttemptFeedbackDto
            {
                QuestionId = attemptAnswer.QuestionId,
                QuestionText = attemptAnswer.QuestionText,
                QuestionType = attemptAnswer.QuestionType,
                AnswerId = attemptAnswer.AnswerId,
                AnswerText = attemptAnswer.AnswerText,
                IsCorrect = attemptAnswer.IsCorrect,
                PointsAwarded = attemptAnswer.PointsAwarded,
                CorrectAnswerText = string.Join(", ",
                    attemptAnswer.Question.Answers
                        .Where(answer => answer.IsCorrect)
                        .Select(answer => answer.Text))
            };
        }
    }
}
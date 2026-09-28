using API.DTOs.QuestionDTO;
using FluentValidation;

namespace API.Validations.Question
{
    public class AddQuestionRequestValidator : AbstractValidator<AddQuestionRequest>
    {
        public AddQuestionRequestValidator() {
            RuleFor(x => x.Text)
                .NotEmpty()
                .WithMessage("Question text is required")
                .MaximumLength(500)
                .WithMessage("Question text cannot exceed 500 characters");

            RuleFor(x => x.Type)
                .NotEmpty()
                .WithMessage("Question type is required")
                .Must(t => t == "single" || t == "multiple")
                .WithMessage("Question type must be single or multiple");

            RuleFor(x => x.Answers)
                .Must(t => t.Count >= 2)
                .WithMessage("At least 2 answers are required")
                .NotEmpty()
                .WithMessage("At least one answer is required")
                .Must(t => t.Count <= 6)
                .WithMessage("Maximum 6 possible answers")
                .Must(t => t.Any( a => a.IsCorrect))
                .WithMessage("At least one correct answer is required");
            RuleForEach(x => x.Answers)
                .SetValidator(new AddAnswerRequestValidator());
        }
    }
}

using API.DTOs.TestsDTO;
using FluentValidation;

namespace API.Validations.Tests
{
    public class UpdateQuestionRequestValidator : AbstractValidator<TestUpdateQuestionRequest>
    {
        public UpdateQuestionRequestValidator()
        {
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
                .NotEmpty()
                .WithMessage("At least one answer is required")
                .Must(a => a.Count >= 2)
                .WithMessage("At least 2 answers are required")
                .Must(a => a.Count <= 6)
                .WithMessage("Maximum 6 possible answers")
                .Must(a => a.Any(x => x.IsCorrect))
                .WithMessage("At least one correct answer is required");

            RuleForEach(x => x.Answers)
                .SetValidator(new UpdateAnswerRequestValidator());
        }
    }
}

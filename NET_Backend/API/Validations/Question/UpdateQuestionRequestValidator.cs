using API.DTOs.QuestionDTO;
using FluentValidation;

namespace API.Validations.Question
{
    public class UpdateQuestionRequestValidator : AbstractValidator<UpdateQuestionRequest>
    {
        public UpdateQuestionRequestValidator() {
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
        }
    }
}

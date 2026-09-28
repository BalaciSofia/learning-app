using API.DTOs.QuestionDTO;
using FluentValidation;

namespace API.Validations.Question
{
    public class UpdateAnswerRequestValidator : AbstractValidator<UpdateAnswerRequest>
    {
        public UpdateAnswerRequestValidator()
        {
            RuleFor(x => x.Text)
                .NotEmpty()
                .WithMessage("Answer text is required")
                .MaximumLength(500)
                .WithMessage("Answer text cannot exceed 500 characters");
        }
    }
}

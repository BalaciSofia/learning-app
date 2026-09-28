using API.DTOs.TestsDTO;
using FluentValidation;

namespace API.Validations.Tests
{
    public class UpdateAnswerRequestValidator : AbstractValidator<TestUpdateAnswerRequest>
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

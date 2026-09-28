using API.DTOs.TestsDTO;
using FluentValidation;

namespace API.Validations.Tests
{
    public class UpdateTestRequestValidator : AbstractValidator<UpdateTestRequest>
    {
        public UpdateTestRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Title is required")
                .MaximumLength(200)
                .WithMessage("Title cannot exceed 200 characters");

            RuleFor(x => x.Description)
                .MaximumLength(2000)
                .WithMessage("Description cannot exceed 2000 characters");

            RuleForEach(x => x.Questions)
                .SetValidator(new UpdateQuestionRequestValidator());
        }
    }
}

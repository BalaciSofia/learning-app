using API.DTOs.CourseDTO.Units;
using FluentValidation;

namespace API.Validations.Courses
{
    public class UnitUpdateDtoValidator : AbstractValidator<UnitUpdateDto>
    {
        public UnitUpdateDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Unit title is mandatory")
                .MaximumLength(200).WithMessage("Title length must be maximum of 200 characters");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description length must be maximum of 1000 characters");
        }
    }
}
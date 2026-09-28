using API.DTOs.CourseDTO.Courses;
using Domain.Entities.Courses;
using FluentValidation;

namespace API.Validations.Courses;

public class CourseCreateDtoValidator : AbstractValidator<CourseCreateDto>
{
    public CourseCreateDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Course title is mandatory")
            .MaximumLength(200).WithMessage("Title length  must be maximum of 200 characters");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Course description is mandatory")
            .MaximumLength(2000).WithMessage("Description length must be maximum of 2000 characters");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Course subject is mandatory")
            .MaximumLength(100).WithMessage("Subject length must be maximum of 100 characters");

        RuleFor(x => x.Metadata) 
            .NotEmpty().WithMessage("Course grade metadata is mandatory")
            .MaximumLength(50).WithMessage("Metadata length must be maximum of 50 characters");
    }
}
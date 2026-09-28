using API.DTOs.CourseDTO.Lessons;
using FluentValidation;

namespace API.Validations.Courses
{
    public class LessonCreateDtoValidator : AbstractValidator<LessonCreateDto>
    {
        private readonly string[] _validTypes = { "video", "reading", "activity", "quiz" };

        public LessonCreateDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Lesson title is mandatory")
                .MaximumLength(200).WithMessage("Title length must be less than 200 characters");

            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Lesson description length must be less than 1000 characters");

            RuleFor(x => x.Duration)
                .GreaterThan(0).WithMessage("Lesson duration must be greater than 0")
                .LessThan(600).WithMessage("Lesson duration must be less than 600 minutes");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Lesson type is mandatory")
                .Must(type => type != null && _validTypes.Contains(type.ToLower()))
                .WithMessage($"Invalid lesson type. Available lesson types: {string.Join(", ", _validTypes)}");

            RuleFor(x => x.Content)
                .NotNull().WithMessage("Content is mandatory");
            
            When(x => x.Type?.ToLower() == "video", () =>
            {
                RuleFor(x => x.Content.VideoUrl)
                    .NotEmpty().WithMessage("URL is mandatory for video lessons")
                    .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
                    .WithMessage("Invalid URL");
            });

            When(x => x.Type?.ToLower() == "reading" || x.Type?.ToLower() == "activity", () =>
            {
                RuleFor(x => x.Content.BodyText)
                    .NotEmpty().WithMessage(
                        "Body text is mandatory for activity/reading lessons");
            });

            When(x => x.Type?.ToLower() == "quiz", () =>
            {
                RuleFor(x => x.Content.QuizId)
                    .NotNull().WithMessage("Quiz id is mandatory for quiz lessons")
                    .GreaterThan(0).WithMessage("Invalid quiz id");
            });
        }
    }
}
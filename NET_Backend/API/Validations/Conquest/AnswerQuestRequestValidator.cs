using API.DTOs.ConquestDTO;
using FluentValidation;

namespace API.Validations.Conquest
{
    public class AnswerQuestRequestValidator : AbstractValidator<AnswerQuestRequest>
    {
        public AnswerQuestRequestValidator() {
            RuleFor(x => x.CourseId).NotEmpty();
            RuleFor(x => x.QuestId).NotEmpty();
            RuleFor(x => x.AnswerIds)
                .NotEmpty()
                .WithMessage("Check at least one answer!")
                .Must(ids => ids.Distinct().Count() == ids.Count);  
        }
    }
}

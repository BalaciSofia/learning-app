using API.DTOs.ConquestDTO;
using FluentValidation;

namespace API.Validations.Conquest
{
    public class ClaimTreasureRequestValidator : AbstractValidator<ClaimTreasureRequest>
    {
        public ClaimTreasureRequestValidator() { 
            RuleFor(x => x.CourseId).NotEmpty();
            RuleFor(x => x.TreasureId).NotEmpty();
        }
    }
}

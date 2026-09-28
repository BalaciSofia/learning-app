using Domain.Entities;
using Domain.Enums;

namespace Application.Helper.IHelper
{
    public interface IMedalEvaluator
    {
        IReadOnlyList<MedalType> GetNewlyEarned(StudentProfile profile);
    }
}

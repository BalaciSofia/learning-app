using Domain.Entities;

namespace Application.Helper.IHelper
{
    public interface IScoreCalculator
    {
        void RecalculateScore(TestAttempt attempt, Test test);
        bool IsMultipleChoice(string questionType);
    }
}
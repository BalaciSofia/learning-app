namespace Application.Helper.IHelper
{
    public interface ILevelCalculator
    {
        int ComputeLevel(int xp);
        string ComputeRank(int level);
    }
}

using Domain.Entities;
using Domain.Enums;
using Application.Common.Results;

namespace Application.Interfaces
{
    public interface ITestsService
    {
        Task<Test> CreateTestAsync(Test test);
        Task<bool> DeleteTestAsync(int testId);
        Task<IEnumerable<Test>> GetTestsForUserAsync(int userId, Role role);
        Task<Test?> GetTestByIdAsync(int id);
        Task<Test?> UpdateTestAsync(Test test);
        Task<Test?> PublishTestAsync(int testId);
        Task<TestStatsResult?> GetTestStatsAsync(int testId);

    }
}

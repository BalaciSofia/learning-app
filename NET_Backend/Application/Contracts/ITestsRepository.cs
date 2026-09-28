using Domain.Entities;

namespace Application.Contracts
{
    public interface ITestsRepository
    {
        Task<Test> AddTestAsync(Test test);
        Task<Test?> GetByIdAsync(int id);
        Task<IEnumerable<Test>> GetAllByCreatorIdAsync(int creatorId);
        Task<IEnumerable<Test>> GetAllAsync();
        Task<IEnumerable<Test>> GetPublishedAsync();
        Task<Test?> ReplaceAsync(Test test);
        Task<Test?> PublishAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}

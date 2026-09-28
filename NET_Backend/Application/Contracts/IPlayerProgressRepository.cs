using Domain.Entities;

namespace Application.Contracts
{
    public interface IPlayerProgressRepository
    {
        Task<PlayerProgress?> GetByUserAndMapAsync(int userId, Map map);
        Task AddAsync(PlayerProgress progress);
        Task UpdateAsync(PlayerProgress progress);
        Task SaveChangesAsync();
        Task<PlayerProgress> CreateAsync(PlayerProgress progress);
        Task<int> AddZoneToConquestAsync(PlayerProgress progress, Zone zone, int zoneXp);
    }
}

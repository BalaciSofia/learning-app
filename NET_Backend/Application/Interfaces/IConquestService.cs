using Domain.Entities;

namespace Application.Interfaces
{
    public interface IConquestService
    {
        Task<Treasure?> GetTreasureByIdAsync(int treasureId);
        Task<Quest?> GetQuestByIdAsync(int questId);
        Task<PlayerProgress?> ClaimTreasureAsync(int userId, Treasure treasure, int courseId);
        Task<(bool correct, int xpAwarded, PlayerProgress? progress)> AnswerQuestAsync(int userId, Quest quest, List<int> answerIds, int courseId);
        Task<Map?> GetMapByCourseIdAsync(int courseId);
        Task<Zone?> GetZoneByIdAsync(int zoneId);
        Task<PlayerProgress?> GetConquestForUserAndMapAsync(int userId, Map map);
        Task<int?> ConquerNewZoneAsync(int userId, Map map, Zone zone, List<Answer> answer);
        
        Task<IEnumerable<Quest>> GetAllQuestsForMapAsync(int mapId);
        
        Task<IEnumerable<Treasure>> GetAllTreasuresForMapAsync(int mapId);
    }
}

using Application.Contracts;
using Application.Interfaces;
using Domain.Entities;
using Domain.Entities.Courses;

namespace Application.UseCases.Conquest
{
    public class ConquestService : IConquestService
    {
        private readonly IMapRepository _mapRepository;
        private readonly IPlayerProgressRepository _playerProgressRepository;
        private readonly ITreasureRepository _treasureRepository;
        private readonly IQuestRepository _questRepository;
        private readonly IZoneRepository _zoneRepository;
        private readonly IQuestionService _questionService;

        public ConquestService(
            IMapRepository mapRepository,
            IPlayerProgressRepository playerProgressRepository,
            ITreasureRepository treasureRepository,
            IQuestRepository questRepository,
            IZoneRepository zoneRepository,
            IQuestionService questionService)
        {
            _mapRepository = mapRepository;
            _playerProgressRepository = playerProgressRepository;
            _treasureRepository = treasureRepository;
            _questRepository = questRepository;
            _zoneRepository = zoneRepository;
            _questionService = questionService;
        }

        public async Task<Treasure?> GetTreasureByIdAsync(int treasureId)
        {
            return await _treasureRepository.GetByIdAsync(treasureId);
        }

        public async Task<Quest?> GetQuestByIdAsync(int questId)
        {
            return await _questRepository.GetByIdAsync(questId);
        }

        public async Task<Map?> GetMapByCourseIdAsync(int courseId)
        {
            return await _mapRepository.GetByCourseIdAsync(courseId);
        }

        public async Task<Zone?> GetZoneByIdAsync(int zoneId)
        {
            return await _zoneRepository.GetByIdAsync(zoneId);
        }

        public async Task<PlayerProgress?> GetConquestForUserAndMapAsync(int userId, Map map)
        {
            return await _playerProgressRepository.GetByUserAndMapAsync(userId, map);
        }

        public async Task<int?> ConquerNewZoneAsync(int userId, Map map, Zone zone, List<Answer> answer)
        {
            var progress = await _playerProgressRepository.GetByUserAndMapAsync(userId, map);

            if (progress is null)
            {
                progress = await _playerProgressRepository.CreateAsync(new PlayerProgress
                {
                    UserId = userId,
                    MapId = map.Id,
                    TotalXp = 0,
                    ConqueredZones = new List<Zone>(),
                    ClaimedQuests = new List<Quest>(),
                    ClaimedTreasures = new List<Treasure>()
                });
            }

            var conqueredZoneIds = progress.ConqueredZones.Select(z => z.Id).ToHashSet();

            if (conqueredZoneIds.Contains(zone.Id))
            {
                return progress.TotalXp;
            }

            bool isUnlocked = zone.PredecessorZoneId is null
                || conqueredZoneIds.Contains(zone.PredecessorZoneId.Value);

            if (!isUnlocked)
            {
                return null;
            }

            var question = zone.Question;
            if(await _questionService.AnswerQuestionAsync(question.Id, answer))
                return await _playerProgressRepository.AddZoneToConquestAsync(progress, zone, zone.XpReward);
            return null;
        }

        public async Task<PlayerProgress?> ClaimTreasureAsync(int userId, Treasure treasure, int courseId)
        {
            var map = await _mapRepository.GetByCourseIdAsync(courseId);
            if (map == null)
                return null;

            var progress = await _playerProgressRepository.GetByUserAndMapAsync(userId, map);
            if (progress == null)
            {
                progress = new PlayerProgress
                {
                    UserId = userId,
                    MapId = map.Id,
                    LastUpdated = DateTime.UtcNow
                };
                await _playerProgressRepository.AddAsync(progress);
            }

            if (progress.ClaimedTreasures.Any(t => t.Id == treasure.Id))
                return progress;

            progress.ClaimedTreasures.Add(treasure);
            progress.TotalXp += treasure.XpReward;
            progress.LastUpdated = DateTime.UtcNow;

            await _playerProgressRepository.UpdateAsync(progress);
            await _playerProgressRepository.SaveChangesAsync();

            return progress;
        }

        
        
        public async Task<(bool correct, int xpAwarded, PlayerProgress? progress)> AnswerQuestAsync(int userId, Quest quest, List<int> answerIds, int courseId)
        {
            var map = await _mapRepository.GetByCourseIdAsync(courseId);
            if (map == null)
                return (false, 0, null);

            var progress = await _playerProgressRepository.GetByUserAndMapAsync(userId, map);
            if (progress == null)
            {
                progress = new PlayerProgress
                {
                    UserId = userId,
                    MapId = map.Id,
                    LastUpdated = DateTime.UtcNow
                };
                await _playerProgressRepository.AddAsync(progress);
            }

            if (progress.ClaimedQuests.Any(q => q.Id == quest.Id))
                return (true, 0, progress);

            if (quest.XpThreshold > progress.TotalXp)
                return (false, 0, progress);

            var correctAnswerIds = quest.Question.Answers
                .Where(a => a.IsCorrect)
                .Select(a => a.Id)
                .ToList();

            var allQuestionAnswerIds = quest.Question.Answers
                .Select(a => a.Id)
                .ToList();

            if (answerIds.Any(id => !allQuestionAnswerIds.Contains(id)))
                return (false, 0, progress);

            var isCorrect = correctAnswerIds.Count == answerIds.Count
                && correctAnswerIds.All(id => answerIds.Contains(id));

            if (!isCorrect)
                return (false, 0, progress);

            progress.ClaimedQuests.Add(quest);
            progress.TotalXp += quest.XpReward;
            progress.LastUpdated = DateTime.UtcNow;

            await _playerProgressRepository.UpdateAsync(progress);
            await _playerProgressRepository.SaveChangesAsync();

            return (true, quest.XpReward, progress);
        }

        public Task<IEnumerable<Quest>> GetAllQuestsForMapAsync(int mapId)
        {
            return _questRepository.GetAllQuestsForMapAsync(mapId);
        }

        public Task<IEnumerable<Treasure>> GetAllTreasuresForMapAsync(int mapId)
        {
            return _treasureRepository.GetAllTreasureForMapAsync(mapId);
        }
    }
}

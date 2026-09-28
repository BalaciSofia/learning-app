using API.DTOs.ConquestDTO;
using API.DTOs.QuestionDTO;
using Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{
    [Mapper]
    public partial class ConquestMapper
    {
        private readonly QuestionMapper _questionMapper;

        public ConquestMapper(QuestionMapper questionMapper)
        {
            _questionMapper = questionMapper;
        }

        public ConquestResponse ToConquestResponse(PlayerProgress playerProgress, Map map)
        {
            var response = MapProgressToResponse(playerProgress);

            if (map != null)
            {
                response.AllZones = map.Zones != null 
                    ? map.Zones.Select(ToZoneResponse).ToList() 
                    : new List<ZoneResponse>();

                response.AllQuests = map.Quests != null 
                    ? map.Quests.Select(ToQuestResponse).ToList() 
                    : new List<QuestResponse>();

                response.AllTreasures = map.Treasures != null 
                    ? map.Treasures.Select(ToTreasureResponse).ToList() 
                    : new List<TreasureResponse>();
            }
            else
            {
                response.AllZones = new List<ZoneResponse>();
                response.AllQuests = new List<QuestResponse>();
                response.AllTreasures = new List<TreasureResponse>();
            }

            return response;
        }

        [MapProperty(nameof(PlayerProgress.ClaimedQuests), nameof(ConquestResponse.ConqueredQuests))]
        [MapProperty(nameof(PlayerProgress.ClaimedTreasures), nameof(ConquestResponse.ConqueredTreasures))]
        private partial ConquestResponse MapProgressToResponse(PlayerProgress playerProgress);
        
        public QuestResponse ToQuestResponse(Quest quest)
        {
            if (quest == null) return null!;

            return new QuestResponse
            {
                Id = quest.Id,
                Name = quest.Name,
                XpReward = quest.XpReward,
                Question = quest.Question != null ? _questionMapper.ToResponse(quest.Question) : null!
            };
        }

        public partial TreasureResponse ToTreasureResponse(Treasure treasure);

        public ZoneResponse ToZoneResponse(Zone zone)
        {
            if (zone == null) return null!;

            return new ZoneResponse
            {
                Id = zone.Id,
                Name = zone.Name,
                XpReward = zone.XpReward,
                Question = null! 
            };
        }
    }
}
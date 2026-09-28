namespace API.DTOs.ConquestDTO
{
    public class ConquestResponse
    {
        public ICollection<ZoneResponse> AllZones { get; set; } = new List<ZoneResponse>();
        public ICollection<ZoneResponse> ConqueredZones { get; set; } = new List<ZoneResponse>();
        public ICollection<QuestResponse> ConqueredQuests { get; set; } = new List<QuestResponse>();
        public List<QuestResponse> AllQuests { get; set; } = new();
        public List<TreasureResponse> AllTreasures { get; set; } = new();
        public List<TreasureResponse> ConqueredTreasures { get; set; } = new();
        public int TotalXp { get; set; }
    }
}
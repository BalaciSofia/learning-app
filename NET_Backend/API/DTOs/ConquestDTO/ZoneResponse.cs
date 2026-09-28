using API.DTOs.QuestionDTO;

namespace API.DTOs.ConquestDTO
{
    public class ZoneResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int XpReward { get; set; }
        
        public QuestionResponse Question { get; set; }
    }
}


using Domain.Entities;

namespace API.DTOs.ConquestDTO
{
    public class AnswerQuestRequest
    {
        public int QuestId { get; set; }
        public List<int> AnswerIds { get; set; } = new List<int>();
        public int CourseId { get; set; }
    }
}

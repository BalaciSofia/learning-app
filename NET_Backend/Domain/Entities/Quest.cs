using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Quest
    {
        public int Id { get; set; }
        public int MapId { get; set; }
        public required string Name { get; set; }
        public int XpReward { get; set; }
        public int XpThreshold { get; set; }
        public int QuestionId { get; set; }

        public Map Map { get; set; }
        public Question Question { get; set; }
    }
}

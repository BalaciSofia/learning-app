using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace Domain.Entities
{
    public class PlayerProgress
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MapId { get; set; }
        public int TotalXp { get; set; }
        public ICollection<Zone> ConqueredZones { get; set; } = new List<Zone>();
        public ICollection<Quest> ClaimedQuests { get; set; } = new List<Quest>();
        public ICollection<Treasure> ClaimedTreasures { get; set; } = new List<Treasure>();
        public DateTime LastUpdated { get; set; }

        public Map Map { get; set; }
        public User User { get; set; }
    }
}

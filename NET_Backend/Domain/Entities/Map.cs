using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Map
    {
        public int Id { get; set; }
        public int? CourseId { get; set; }
        public required string Name { get; set; }

        public ICollection<Zone> Zones { get; set; } = new List<Zone>();
        public ICollection<Quest> Quests { get; set; } = new List<Quest>();
        public ICollection<Treasure> Treasures { get; set; } = new List<Treasure>();
    }
}

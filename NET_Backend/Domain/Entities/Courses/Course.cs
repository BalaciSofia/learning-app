namespace Domain.Entities.Courses
{
    public class Course
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string Subject { get; set; }
        
        public string Metadata { get; set; }
        
        public int EnrolledStudentsCount { get; set; }
        
        public List<Unit> Units { get; set; } = new List<Unit>();
        
        public List<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        
        public Institution Institution { get; set; }
        
        public int InstitutionId { get; set; }

        public int CreatorId { get; set; }

        public User Creator { get; set; }

        public bool IsPublished { get; set; } = false;

        public void AddUnit(Unit unit)
        {
            Units.Add(unit);
        }
    }
}
namespace Domain.Entities.Courses
{
    public class Unit
    {
        public int Id { get; set; }
        
        public string Title { get; set; }
        public string Description { get; set; }
        public List<Lesson> Lessons { get; set; } = new List<Lesson>();
        
        public int CourseId { get; set; }
        
        public Course Course { get; set; }
    }
}
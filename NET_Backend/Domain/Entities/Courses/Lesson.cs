using Domain.Enums;

namespace Domain.Entities.Courses
{
    public class Lesson
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; } //likely  JSON in db, if of type Quiz I link the lesson with the quiz table 
        
        public string Description { get; set; }
        
        public int Duration { get; set; }
        public LessonType Type { get; set; }
        
        public int UnitId { get; set; }
        
        public Unit? Unit { get; set; }
    }
}
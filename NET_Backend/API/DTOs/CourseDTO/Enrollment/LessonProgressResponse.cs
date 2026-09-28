namespace API.DTOs.CourseDTO.Enrollment
{
    public class LessonProgressResponse
    {
        public int LessonId { get; set; }
        public bool Completed { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}

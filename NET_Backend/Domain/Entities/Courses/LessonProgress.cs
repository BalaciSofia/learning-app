namespace Domain.Entities.Courses
{
    public class LessonProgress
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public int LessonId { get; set; }
        public bool Completed { get; set; }
        public DateTime? CompletedAt { get; set; }

        public Enrollment Enrollment { get; set; } = null!;
        public Lesson Lesson { get; set; } = null!;
    }
}

namespace API.DTOs.CourseDTO.Enrollment
{
    public class ProgressSummaryResponse
    {
        public double ProgressPercent { get; set; }
        public List<LessonProgressResponse> Lessons { get; set; } = new List<LessonProgressResponse>();

        public ProgressSummaryResponse() { }

        public ProgressSummaryResponse(double progressPercent, List<LessonProgressResponse> lessons)
        {
            ProgressPercent = progressPercent;
            Lessons = lessons;
        }
    }
}

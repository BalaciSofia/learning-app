namespace API.DTOs.CourseDTO.Lessons
{
    public record LessonResponse(
        int Id,
        string Title,
        LessonContentDto Content,
        string Description,
        int Duration,
        string Type
    );
}
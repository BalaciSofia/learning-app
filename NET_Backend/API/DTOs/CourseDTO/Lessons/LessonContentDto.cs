namespace API.DTOs.CourseDTO.Lessons
{
    public record LessonContentDto(
        string? VideoUrl,
        string? BodyText,
        int? QuizId
        );    
}

namespace API.DTOs.CourseDTO.Lessons
{
    public record LessonUpdateDto(
        string Title,
        string Description,
        string Type,
        int Duration,
        LessonContentDto Content
        );    
}

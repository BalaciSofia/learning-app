namespace API.DTOs.CourseDTO.Lessons
{
    public record LessonCreateDto(
        string Title,
        string Type, 
        string Description,
        int Duration,
        LessonContentDto Content
    );
    
}

using System.Text.Json;
using API.DTOs.CourseDTO.Courses;
using API.DTOs.CourseDTO.Lessons;
using API.DTOs.CourseDTO.Units;
using Domain.Entities.Courses;
using Riok.Mapperly.Abstractions;

namespace API.Mapping
{

    [Mapper]
    public partial class CourseMapper
    {
        public partial CourseResponse ToDto(Course course);

        public partial UnitResponse ToDto(Unit unit);
        
        public partial LessonResponse ToDto(Lesson lesson);
        
        private LessonContentDto MapContent(string contentJson)
        {
            if (string.IsNullOrWhiteSpace(contentJson)) 
            {
                return new LessonContentDto(null, null, null);
            }

            try 
            {
                return JsonSerializer.Deserialize<LessonContentDto>(contentJson, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                }) ?? new LessonContentDto(null, null, null);
            }
            catch (JsonException)
            {
                return new LessonContentDto(null, null, null);
            }
        }
        private string MapContentToString(LessonContentDto contentDto)
        {
            if (contentDto == null)
            {
                return "{}";
            }

            return JsonSerializer.Serialize(contentDto, new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            });
        }
        
        public partial Course ToDomain(CourseCreateDto course);

        public partial Unit ToDomain(UnitCreateDto unit);
        
        public partial Lesson ToDomain(LessonCreateDto lesson);
        
        public partial Course ToDomain(CourseUpdateDto course);
    }
}
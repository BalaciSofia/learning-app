using System.Text.Json;
using Application.Contracts;
using Application.Interfaces;
using Domain.Entities.Courses;
using Domain.Enums;

namespace Application.UseCases.Courses
{
    public class LessonService : ILessonService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly IUnitRepository _unitRepository;
        private readonly ITestsRepository _testsRepository;

        public LessonService(ILessonRepository lessonRepository, IUnitRepository unitRepository, ITestsRepository testsRepository)
        {
            _lessonRepository = lessonRepository;
            _unitRepository = unitRepository;
            _testsRepository = testsRepository;
        }

        public async Task<Lesson?> CreateLessonAsync(int unitId, Lesson lesson)
        {
            var unit = await _unitRepository.GetByIdAsync(unitId);
            if (unit == null)
            {
                return null;
            }

            if (lesson != null && lesson.Type == LessonType.Quiz)
            {
                await ValidateAndExtractQuizIdAsync(lesson.Content);
            }

            lesson.UnitId = unitId;
            return await _lessonRepository.CreateAsync(lesson);
        }

        public async Task<Lesson?> GetLessonByIdAsync(int id)
        {
            return await _lessonRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Lesson>?> GetLessonsByUnitIdAsync(int unitId)
        {
            var unit = await _unitRepository.GetByIdAsync(unitId);
            if (unit == null)
            {
                return null;
            }
            return await _lessonRepository.GetLessonsByUnitIdAsync(unitId);
        }

        public async Task<bool> UpdateLessonAsync(Lesson lesson)
        {
            var existingLesson = await _lessonRepository.GetByIdAsync(lesson.Id);
            if (existingLesson == null)
            {
                return false;
            }

            if (lesson.Type == LessonType.Quiz)
            {
                await ValidateAndExtractQuizIdAsync(lesson.Content);
            }

            existingLesson.Title = lesson.Title;
            existingLesson.Content = lesson.Content;
            existingLesson.Description = lesson.Description;
            existingLesson.Duration = lesson.Duration;
            existingLesson.Type = lesson.Type;
            
            await _lessonRepository.UpdateAsync(existingLesson);
            return true;
        }

        public async Task<bool> DeleteLessonAsync(int id)
        {
            var lesson = await _lessonRepository.GetByIdAsync(id);
            if (lesson == null)
            {
                return false;
            }
            await _lessonRepository.DeleteAsync(lesson);
            return true;
        }

        private async Task ValidateAndExtractQuizIdAsync(string contentJson)
        {
            if (string.IsNullOrWhiteSpace(contentJson))
            {
                throw new InvalidOperationException("Lesson content cannot be empty for a Quiz type.");
            }

            try
            {
                using var doc = JsonDocument.Parse(contentJson);
                
                if (!doc.RootElement.TryGetProperty("quizId", out var quizIdElement) || 
                    quizIdElement.ValueKind != JsonValueKind.Number)
                {
                    throw new InvalidOperationException("The JSON content must contain a valid numeric 'quizId'.");
                }

                int quizId = quizIdElement.GetInt32();
                var test = await _testsRepository.GetByIdAsync(quizId);
                
                if (test == null)
                {
                    throw new InvalidOperationException($"Quiz with ID {quizId} does not exist.");
                }
            }
            catch (JsonException)
            {
                throw new InvalidOperationException("Invalid JSON format in lesson content.");
            }
        }
    }
}
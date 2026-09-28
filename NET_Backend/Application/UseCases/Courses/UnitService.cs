using Application.Contracts;
using Application.Interfaces;
using Domain.Entities.Courses;

namespace Application.UseCases.Courses
{
    public class UnitService : IUnitService
    {
        private readonly IUnitRepository _unitRepository;
        private readonly ICourseRepository _courseRepository;

        public UnitService(IUnitRepository unitRepository, ICourseRepository courseRepository)
        {
            _unitRepository = unitRepository;
            _courseRepository = courseRepository;
        }

        public async Task<Unit?> CreateUnitAsync(int courseId, Unit unit)
        {
            var course = await _courseRepository.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return null;
            }
            course.AddUnit(unit);
            await _courseRepository.UpdateCourseAsync(course);
            return unit;
        }

        public async Task<Unit?> GetUnitByIdAsync(int id)
        {
            return await _unitRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<Unit>?> GetUnitsByCourseIdAsync(int courseId)
        {
            var course = await _courseRepository.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return null;
            }

            return await _unitRepository.GetUnitsByCourseIdAsync(courseId);
        }

        public async Task<bool> UpdateUnitAsync(Unit unit)
        {
            var existingUnit = await _unitRepository.GetByIdAsync(unit.Id);
            if (existingUnit == null)
            {
                return false;
            }

            existingUnit.Title = unit.Title;
            existingUnit.Description = unit.Description;
            await _unitRepository.UpdateAsync(existingUnit);
            return true;
        }

        public async Task<bool> DeleteUnitAsync(int id)
        {
            var unit = await _unitRepository.GetByIdAsync(id);
            if (unit == null)
            {
                return false;
            }
            await _unitRepository.DeleteAsync(unit);
            return true;
        }
    }
}
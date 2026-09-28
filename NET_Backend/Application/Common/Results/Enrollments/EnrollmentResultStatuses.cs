namespace Application.Common.Results.Enrollments
{
    public enum EnrollStatus
    {
        Success,
        CourseNotFound
    }

    public enum GetProgressStatus
    {
        Success,
        CourseNotFound,
        NotEnrolled
    }

    public enum CompleteLessonStatus
    {
        Success,
        CourseNotFound,
        NotEnrolled,
        UnitNotFound,
        LessonNotFound
    }
}

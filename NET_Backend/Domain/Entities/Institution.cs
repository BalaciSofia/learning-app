namespace Domain.Entities.Courses
{
    public class Institution
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Course> Courses { get; set; }

        public void AddCourse(Course course)
        {
            Courses.Add(course);
        }
    }
}
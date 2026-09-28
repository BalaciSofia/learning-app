namespace Domain.Entities
{
    public class Question
    {
        public int Id { get; set; }
        public required string Text { get; set; }
        public required string Type { get; set; }
        public int TestId { get; set; }
        public Test Test { get; set; }
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}
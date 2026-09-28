namespace Domain.Entities
{
    public  class Test
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int CreatorId { get; set; }
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public bool IsRetakeAllowed {  get; set; }
        public bool IsPublished { get; set; } = false;
    }
}

namespace Application.Interfaces
{
    public interface IDistractorService
    {
        Task<IReadOnlyList<string>> GenerateDistractorsAsync(
            string questionText,
            string correctAnswer,
            CancellationToken cancellationToken);
    }
}
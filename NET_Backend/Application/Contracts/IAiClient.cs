namespace Application.Contracts;

public interface IAiClient
{ 
    Task<string> GenerateAsync(string prompt, CancellationToken cancellationToken = default);
}
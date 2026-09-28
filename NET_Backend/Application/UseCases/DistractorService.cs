using Application.Common.Constants;
using Application.Contracts;
using Application.Interfaces;

namespace Application.UseCases;

using System.Text.Json;
using Application.Interfaces;
using Application.Helper;

public class DistractorService : IDistractorService
{
    private readonly IAiClient _aiClient;

    public DistractorService(IAiClient aiClient)
    {
        _aiClient = aiClient;
    }

    public async Task<IReadOnlyList<string>> GenerateDistractorsAsync(string questionText, string correctAnswer,
        CancellationToken cancellationToken)
    {
        string prompt = PromptBuilder.Build(questionText, correctAnswer);

        using var timeoutCts = new CancellationTokenSource(LlmConstants.TimeoutSeconds);

        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken,
            timeoutCts.Token);

        try
        {
            string response = await _aiClient.GenerateAsync(
                prompt,
                linkedCts.Token);

            LlmQuizResponse? parsed = JsonSerializer.Deserialize<LlmQuizResponse>(
                response,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            if (parsed is null || parsed.Distractors.Count != 3)
            {
                throw new InvalidOperationException("Invalid LLM response.");
            }

            return parsed.Distractors;
        }
        catch (OperationCanceledException) when (timeoutCts.IsCancellationRequested)
        {
            throw new TimeoutException("Distractor generation timed out.");
        }

    }

    private class LlmQuizResponse
    {
        public List<string> Distractors { get; set; } = new();
    }
}
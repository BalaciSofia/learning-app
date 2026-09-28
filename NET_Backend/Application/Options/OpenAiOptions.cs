namespace Application.Options;

public class OpenAiOptions
{
    public const string SECTION_NAME = "OpenAI";

    public string ApiKey { get; init; } = string.Empty;

    public string Model { get; init; } = string.Empty;
}
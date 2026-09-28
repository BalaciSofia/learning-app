using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Application.Common.Constants;
using Application.Contracts;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services.AiClients
{
    public sealed class GeminiClient : IAiClient
    {
        private const string BaseEndpoint = "v1beta/models";

        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public GeminiClient(
            HttpClient httpClient,
            string apiKey,
            string model)
        {
            _httpClient = httpClient;

            _apiKey = apiKey;
            
            _model = model;
        }

        public async Task<string> GenerateAsync(
            string prompt,
            CancellationToken cancellationToken = default)
        {
            var payload = BuildRequest(prompt);

            HttpResponseMessage response = await _httpClient.PostAsJsonAsync(
                $"{BaseEndpoint}/{_model}:generateContent?key={_apiKey}",
                payload,
                cancellationToken);

            response.EnsureSuccessStatusCode();

            return await ExtractResponseAsync(response, cancellationToken);
        }

        private static JsonObject BuildRequest(string prompt)
        {
            return new JsonObject
            {
                ["contents"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["parts"] = new JsonArray
                        {
                            new JsonObject
                            {
                                ["text"] = prompt
                            }
                        }
                    }
                }
            };
        }

        private static async Task<string> ExtractResponseAsync(
            HttpResponseMessage response,
            CancellationToken cancellationToken)
        {
            await using Stream stream = await response.Content.ReadAsStreamAsync(cancellationToken);

            using JsonDocument json = await JsonDocument.ParseAsync(
                stream,
                cancellationToken: cancellationToken);

            JsonElement root = json.RootElement;

            string? text = root
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text))
            {
                throw new InvalidOperationException("Gemini returned an empty response.");
            }

            return text;
        }
    }
}
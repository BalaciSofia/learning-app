using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using API.DTOs.Distractor;
using Application.Contracts;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Tests.Helpers;

namespace Tests.AiTests
{
    [TestFixture]
    public class DistractorTests
    {
        private WebApplicationFactory<Program> _factory;

        [OneTimeSetUp]
        public void Setup()
        {
            Environment.SetEnvironmentVariable("JWT_SECRET_KEY", "12345678901234567890123456789012");

            Environment.SetEnvironmentVariable("GEMINI_API_KEY", "dummy_gemini_key_for_tests");
            Environment.SetEnvironmentVariable("GEMINI_MODEL", "dummy_model_for_tests");

            _factory = new WebApplicationFactory<Program>();
        }

        [OneTimeTearDown]
        public void TearDown()
        {
            _factory?.Dispose();

            Environment.SetEnvironmentVariable("JWT_SECRET_KEY", null);
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", null);
            Environment.SetEnvironmentVariable("GEMINI_MODEL", null);
        }

        [Test]
        public async Task GenerateDistractors_Returns504_WhenAiClientTimesOut()
        {
            var mockAiClient = new Mock<IAiClient>();

            mockAiClient
                .Setup(c => c.GenerateAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(async (string prompt, CancellationToken ct) =>
                {
                    await Task.Delay(Timeout.Infinite, ct);
                    return string.Empty;
                });

            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.Configure<AuthenticationOptions>(options =>
                    {
                        options.DefaultAuthenticateScheme = "TestAuth";
                        options.DefaultChallengeScheme = "TestAuth";
                        options.DefaultScheme = "TestAuth";
                    });

                    services.AddAuthentication()
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("TestAuth", options => { });

                    var aiClientDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IAiClient));
                    if (aiClientDescriptor != null) services.Remove(aiClientDescriptor);

                    services.AddScoped(_ => mockAiClient.Object);
                });
            }).CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("TestAuth");

            var requestBody = new GenerateDistractorsRequest(
                QuestionText: "Which is the capital city of France?",
                CorrectAnswer: "Paris"
            );

            var response = await client.PostAsJsonAsync("/api/tests/generate-distractors", requestBody);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.GatewayTimeout));

            var responseContent = await response.Content.ReadAsStringAsync();
            var problemDetails = JsonSerializer.Deserialize<ProblemDetails>(responseContent,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            Assert.That(problemDetails, Is.Not.Null);
            Assert.That(problemDetails.Title, Is.EqualTo("Request timed out."));
            Assert.That(problemDetails.Detail, Is.EqualTo("Distractor generation took too long. Please try again."));
        }

        [Test]
        public async Task GenerateDistractors_Returns429_WhenRateLimitExceeded()
        {
            var mockAiClient = new Mock<IAiClient>();

            string validJsonResponse = "{ \"distractors\": [\"Fals 1\", \"Fals 2\", \"Fals 3\"] }";

            mockAiClient
                .Setup(c => c.GenerateAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(validJsonResponse);

            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.Configure<AuthenticationOptions>(options =>
                    {
                        options.DefaultAuthenticateScheme = "TestAuth";
                        options.DefaultChallengeScheme = "TestAuth";
                        options.DefaultScheme = "TestAuth";
                    });

                    services.AddAuthentication()
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("TestAuth", options => { });

                    var aiClientDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IAiClient));
                    if (aiClientDescriptor != null) services.Remove(aiClientDescriptor);

                    services.AddScoped(_ => mockAiClient.Object);
                });
            }).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("TestAuth");

            client.DefaultRequestHeaders.Add("X-Test-User", "SpammingTeacher123");

            var requestBody = new GenerateDistractorsRequest("2 + 2 = ?", "4");

            for (int i = 0; i < 30; i++)
            {
                var response = await client.PostAsJsonAsync("/api/tests/generate-distractors", requestBody);
                if (response.StatusCode != HttpStatusCode.OK)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    Assert.Fail(
                        $"Request number {i + 1} was prematurely rejected with status {response.StatusCode}. Details: {content}");
                }

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            }
            var rateLimitedResponse = await client.PostAsJsonAsync("/api/tests/generate-distractors", requestBody);
            Assert.That(rateLimitedResponse.StatusCode, Is.EqualTo(HttpStatusCode.TooManyRequests));
        }
    }
}
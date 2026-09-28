namespace Application.Helper;

public static class PromptBuilder
{
    public static string Build(
        string questionText,
        string correctAnswer)
    {
        return $$"""
                 You are an educational assistant.

                 Generate exactly 3 plausible but incorrect distractors.

                 Rules:
                 - Return only valid JSON.
                 - Do NOT wrap the JSON in Markdown code blocks (e.g., do not use ```json).
                 - Do not repeat the correct answer.
                 - Do not explain your reasoning.
                 - Make the distractors educationally plausible.
                 - Generate the distractors in the EXACT SAME LANGUAGE as the question provided.

                 Question:
                 {{questionText}}

                 Correct answer:
                 {{correctAnswer}}

                 Return:

                 {
                   "distractors": [
                     "...",
                     "...",
                     "..."
                   ]
                 }
                 """;
    }
}
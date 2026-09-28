namespace API.DTOs.DuelDTO
{
    public class SubmitScoreResponse
    {
        public bool IsCompleted { get; set; }
        public string Message { get; set; } = string.Empty;
        public DuelResultResponse? Result { get; set; }
    }
}

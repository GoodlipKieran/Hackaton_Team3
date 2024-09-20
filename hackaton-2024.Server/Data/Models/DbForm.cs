using System.Text.Json.Serialization;

namespace hackaton_2024.Server.Data.Models
{
    public class DbForm
    {
        [JsonPropertyName("ServerConnectionString")]
        public string ServerName { get; set; } = null!;

        [JsonPropertyName("ServerPort")]
        public string ServerPort { get; set; } = null!;

        [JsonPropertyName("DBName")]
        public string DatabaseName { get; set; } = null!;

        [JsonPropertyName("Login")]
        public string Username { get; set; } = null!;

        [JsonPropertyName("Password")]
        public string Password { get; set; } = null!;

        [JsonPropertyName("TableNames")]
        public List<string> TableNames { get; set; } = null!;
    }
}

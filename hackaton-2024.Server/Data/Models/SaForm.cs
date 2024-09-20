namespace hackaton_2024.Server.Data.Models
{
    public class SaForm
    {
        public string SasToken { get; set; } = null!;
        public string StorageAccountName { get; set; } = null!;
        public string ContainerName { get; set; } = null!;
        public List<string> TableNames { get; set; } = null!;
    }
}

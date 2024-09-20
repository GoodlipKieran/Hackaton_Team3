using hackaton_2024.Server.Data.Entities;

namespace hackaton_2024.Server.Data.Repositories.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetUserWithEmail(string email);
    }
}

using hackaton_2024.Server.Data.Entities;
using hackaton_2024.Server.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace hackaton_2024.Server.Data.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<User?> GetUserWithEmail(string email)
        {
            return await _context.Users
                .Where(u => u.Email == email)
                .FirstOrDefaultAsync();
        }
    }
}

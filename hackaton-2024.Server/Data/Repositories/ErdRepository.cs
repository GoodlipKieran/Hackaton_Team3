using hackaton_2024.Server.Data.Entities;
using hackaton_2024.Server.Data.Repositories.Interfaces;

namespace hackaton_2024.Server.Data.Repositories
{
    public class ErdRepository : Repository<Erd>, IErdRepository
    {
        public ErdRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}

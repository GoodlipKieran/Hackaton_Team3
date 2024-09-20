using hackaton_2024.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace hackaton_2024.Server.Data
{
    public partial class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Erd> Erd { get; set; }
    }
}

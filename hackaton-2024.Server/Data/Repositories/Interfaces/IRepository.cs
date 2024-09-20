using System.Linq.Expressions;

namespace hackaton_2024.Server.Data.Repositories.Interfaces
{
    public interface IRepository<TEntity> where TEntity : class
    {
        Task<TEntity> GetAsync(int id);
        Task<IEnumerable<TEntity>> GetAllAsync();
        IEnumerable<TEntity> Find(Expression<Func<TEntity, bool>> predicate);
        Task<TEntity> AddAsync(TEntity entity);
        Task<IEnumerable<TEntity>> AddRangeAsync(IEnumerable<TEntity> entities);
        Task<TEntity> AddOrUpdateAsync(TEntity entity);
        Task<int> AddOrUpdateRangeAsync(List<TEntity> entity);
        Task<int> RemoveAsync(TEntity entity);
        Task<int> RemoveRangeAsync(List<TEntity> entities);
    }
}

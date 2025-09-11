using Microsoft.EntityFrameworkCore;
using ProductosService.Models;

namespace ProductosService.Data
{
    public class ProductosDbContext : DbContext
    {
        public ProductosDbContext(DbContextOptions<ProductosDbContext> options) : base(options) { }
        public DbSet<Producto> Productos { get; set; }
    }
}

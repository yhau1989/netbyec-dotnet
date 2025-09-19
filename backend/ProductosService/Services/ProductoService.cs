using Microsoft.EntityFrameworkCore;
using ProductosService.Models;
using ProductosService.Data;

namespace ProductosService.Services
{
    public class ProductoService
    {
        private readonly ProductosDbContext _context;
        public ProductoService(ProductosDbContext context)
        {
            _context = context;
        }

        public async Task<List<Producto>> GetProductosAsync(string? nombre, string? categoria)
        {
            try
            {
                var query = _context.Productos.AsQueryable();
                query = query.Where(p => p.Eliminado == null || p.Eliminado == false);
                if (!string.IsNullOrEmpty(nombre))
                    query = query.Where(p => p.Nombre.Contains(nombre));
                if (!string.IsNullOrEmpty(categoria))
                    query = query.Where(p => p.Categoria == categoria);
                return await query.ToListAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Producto?> GetProductoByIdAsync(int id)
        {
            try
            {
                return await _context.Productos
                    .Where(p => p.Id == id && (p.Eliminado == null || p.Eliminado == false))
                    .FirstOrDefaultAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Producto> CreateProductoAsync(Producto producto)
        {
            try
            {
                _context.Productos.Add(producto);
                await _context.SaveChangesAsync();
                return producto;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> UpdateProductoAsync(int id, Producto producto)
        {
            try
            {
                // El objeto ya está modificado, solo guardar cambios
                _context.Productos.Update(producto);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        // Nuevo método para compatibilidad con PATCH
        public async Task<bool> UpdateProductoAsync(Producto producto)
        {
            try
            {
                var existing = await _context.Productos.FindAsync(producto.Id);
                if (existing == null) return false;
                var productoType = typeof(Producto);
                var props = productoType.GetProperties();
                foreach (var prop in props)
                {
                    var newValue = prop.GetValue(producto);
                    if (newValue != null && !Equals(newValue, prop.GetValue(existing)))
                    {
                        prop.SetValue(existing, newValue);
                        _context.Entry(existing).Property(prop.Name).IsModified = true;
                    }
                }
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> DeleteProductoAsync(int id)
        {
            try
            {
                var producto = await _context.Productos.FindAsync(id);
                if (producto == null) return false;
                producto.Eliminado = true;
                _context.Entry(producto).Property(p => p.Eliminado).IsModified = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> UpdateProductoPartialAsync(int id, Dictionary<string, object> fields)
        {
            // Console.WriteLine($"Campos recibidos en PATCH: {System.Text.Json.JsonSerializer.Serialize(fields)}");
            var producto = await _context.Productos.FindAsync(id);
            // Console.WriteLine($"producto: {System.Text.Json.JsonSerializer.Serialize(producto)}");
            if (producto == null) return false;

            var productoType = typeof(Producto);
            foreach (var field in fields)
            {
                var prop = productoType.GetProperty(field.Key, System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                // Console.WriteLine($"prop: {prop} | prop.CanWrite: {prop?.CanWrite} | field.Value : {field.Value }");
                if (prop != null && prop.CanWrite && field.Value != null)
                {
                    try
                    {
                        var targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;
                        object safeValue = null;
                        var value = field.Value;
                        // Si el valor es JsonElement, extraer el valor real
                        if (value is System.Text.Json.JsonElement jsonElement)
                        {
                            if (targetType == typeof(string))
                                safeValue = jsonElement.GetString() ?? string.Empty;
                            else if (targetType == typeof(int))
                                safeValue = jsonElement.TryGetInt32(out var intVal) ? intVal : Convert.ToInt32(jsonElement.GetRawText());
                            else if (targetType == typeof(decimal))
                                safeValue = jsonElement.TryGetDecimal(out var decVal) ? decVal : Convert.ToDecimal(jsonElement.GetRawText());
                            else if (targetType == typeof(double))
                                safeValue = jsonElement.TryGetDouble(out var dblVal) ? dblVal : Convert.ToDouble(jsonElement.GetRawText());
                            else if (targetType == typeof(float))
                                safeValue = jsonElement.TryGetSingle(out var fltVal) ? fltVal : Convert.ToSingle(jsonElement.GetRawText());
                            else if (targetType == typeof(bool))
                            {
                                try
                                {
                                    safeValue = jsonElement.GetBoolean();
                                }
                                catch
                                {
                                    safeValue = Convert.ToBoolean(jsonElement.GetRawText());
                                }
                            }
                            else
                                safeValue = jsonElement.GetRawText();
                        }
                        else
                        {
                            if (targetType == typeof(decimal))
                                safeValue = Convert.ToDecimal(value);
                            else if (targetType == typeof(int))
                                safeValue = Convert.ToInt32(value);
                            else if (targetType == typeof(double))
                                safeValue = Convert.ToDouble(value);
                            else if (targetType == typeof(float))
                                safeValue = Convert.ToSingle(value);
                            else if (targetType == typeof(bool))
                                safeValue = Convert.ToBoolean(value);
                            else
                                safeValue = Convert.ChangeType(value, targetType);
                        }
                        var oldValue = prop.GetValue(producto);
                        // Console.WriteLine($"Propiedad: {prop.Name} | Antes: {oldValue} | Después: {safeValue}");
                        prop.SetValue(producto, safeValue);
                        _context.Entry(producto).Property(prop.Name).IsModified = true;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al actualizar propiedad {prop?.Name}: {ex.Message}");
                        continue;
                    }
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

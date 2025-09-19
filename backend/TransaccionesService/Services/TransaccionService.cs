using System.Text.Json;
using TransaccionesService.DTOs;
using TransaccionesService.Models;
using TransaccionesService.Data;
using Microsoft.EntityFrameworkCore;

namespace TransaccionesService.Services
{
    public class TransaccionService
    {
        private readonly HttpClient _httpClient;
        private readonly string _productosServiceUrl;
        private readonly TransaccionesDbContext _context;

        public async Task<(Transaccion?, string?)> ActualizarTransaccionAsync(int id, Transaccion request)
        {
            var transaccion = await _context.Transacciones.FindAsync(id);
            if (transaccion == null || transaccion.Eliminado == true)
                return (null, "Transacción no encontrada o eliminada.");

            // Guardar valores originales
            int cantidadOriginal = transaccion.Cantidad;
            TipoTransaccionEnum tipoOriginal = transaccion.TipoTransaccion;

            // Solo actualiza los campos permitidos
            transaccion.Cantidad = request.Cantidad;
            transaccion.PrecioUnitario = request.PrecioUnitario;
            transaccion.PrecioTotal = request.PrecioTotal;
            transaccion.Detalle = request.Detalle;
            // No se permite cambiar ProductoId, TipoTransaccion ni Fecha

            // Rectificación de stock
            // Primero, revertir el efecto de la transacción original
            int ajusteStock = 0;
            if (tipoOriginal == TipoTransaccionEnum.Venta)
                ajusteStock += cantidadOriginal; // devolver stock
            else if (tipoOriginal == TipoTransaccionEnum.Compra)
                ajusteStock -= cantidadOriginal; // quitar stock

            // Luego, aplicar el efecto de la nueva transacción
            if (transaccion.TipoTransaccion == TipoTransaccionEnum.Venta)
                ajusteStock -= transaccion.Cantidad; // quitar stock
            else if (transaccion.TipoTransaccion == TipoTransaccionEnum.Compra)
                ajusteStock += transaccion.Cantidad; // sumar stock

            // Consultar producto actual
            var response = await _httpClient.GetAsync($"{_productosServiceUrl}/{transaccion.ProductoId}");
            if (!response.IsSuccessStatusCode)
                return (null, "No se pudo consultar el producto para ajustar stock.");
            var productoJson = await response.Content.ReadAsStringAsync();
            var producto = JsonSerializer.Deserialize<ProductoDto>(productoJson);
            if (producto == null)
                return (null, "Producto no encontrado.");

            // Validar stock suficiente si es venta
            if (transaccion.TipoTransaccion == TipoTransaccionEnum.Venta && (producto.stock + (tipoOriginal == TipoTransaccionEnum.Venta ? cantidadOriginal : 0) < transaccion.Cantidad))
                return (null, "Stock insuficiente para la venta rectificada.");

            // Ajustar stock
            var nuevoStock = producto.stock + ajusteStock;
            var ajuste = new StockAjusteDto { stock = nuevoStock };
            var ajusteJson = new StringContent(JsonSerializer.Serialize(ajuste), System.Text.Encoding.UTF8, "application/json");
            var ajusteResponse = await _httpClient.PatchAsync($"{_productosServiceUrl}/{transaccion.ProductoId}", ajusteJson);
            if (!ajusteResponse.IsSuccessStatusCode)
                return (null, "No se pudo ajustar el stock del producto.");

            await _context.SaveChangesAsync();
            return (transaccion, null);
        }
        public TransaccionService(HttpClient httpClient, IConfiguration configuration, TransaccionesDbContext context)
        {
            _httpClient = httpClient;
            _productosServiceUrl = configuration["ProductosServiceUrl"] ?? "";
            _context = context;
        }

        public async Task<(IEnumerable<Transaccion>, string?)> ObtenerTransaccionesAsync(int? productoId, string? tipo, string? fechaInicio, string? fechaFin)
        {
            var query = _context.Transacciones.AsQueryable();
            query = query.Where(t => t.Eliminado == null || t.Eliminado == false);
            if (productoId.HasValue)
                query = query.Where(t => t.ProductoId == productoId.Value);
            if (!string.IsNullOrEmpty(tipo))
            {
                if (Enum.TryParse<TipoTransaccionEnum>(tipo, out var tipoEnum))
                    query = query.Where(t => t.TipoTransaccion == tipoEnum);
                else
                    return (Enumerable.Empty<Transaccion>(), $"Tipo de transacción inválido: {tipo}");
            }
            if (!string.IsNullOrEmpty(fechaInicio) && DateTime.TryParse(fechaInicio, out var inicio))
                query = query.Where(t => t.Fecha >= inicio);
            if (!string.IsNullOrEmpty(fechaFin) && DateTime.TryParse(fechaFin, out var fin))
                query = query.Where(t => t.Fecha <= fin);
            var result = await query.ToListAsync();
            return (result, null);
        }


        public async Task<(Transaccion?, string?)> CrearTransaccionAsync(Transaccion request)
        {
            var error = await ValidarStockAsync(request);
            if (error != null)
                return (null, error);

            request.Fecha = DateTime.Now;
            _context.Transacciones.Add(request);
            await _context.SaveChangesAsync();

            var ok = await AjustarStockAsync(request);
            if (!ok)
                return (null, "No se pudo ajustar el stock del producto.");

            return (request, null);
        }

        public async Task<string?> ValidarStockAsync(Transaccion transaccion)
        {
            try
            {
                if (transaccion.TipoTransaccion == TipoTransaccionEnum.Venta)
                {
                    var response = await _httpClient.GetAsync($"{_productosServiceUrl}/{transaccion.ProductoId}");
                    if (!response.IsSuccessStatusCode)
                        return "No se pudo consultar el producto.";

                    var productoJson = await response.Content.ReadAsStringAsync();
                    var producto = JsonSerializer.Deserialize<ProductoDto>(productoJson);
                    if (producto == null)
                        return "Producto no encontrado.";

                    if (producto.stock < transaccion.Cantidad)
                        return "Stock insuficiente para la venta.";
                }
                return null;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> AjustarStockAsync(Transaccion transaccion)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_productosServiceUrl}/{transaccion.ProductoId}");
                if (!response.IsSuccessStatusCode)
                    throw new Exception("No se pudo consultar el producto.");

                var productoJson = await response.Content.ReadAsStringAsync();
                var producto = JsonSerializer.Deserialize<ProductoDto>(productoJson);
                if (producto == null)
                    throw new Exception("Producto no encontrado.");

                var ajuste = new StockAjusteDto { stock = producto.stock };
                if (transaccion.TipoTransaccion == TipoTransaccionEnum.Venta)
                    ajuste.stock -= transaccion.Cantidad;
                else
                    ajuste.stock += transaccion.Cantidad;

                var ajusteJson = new StringContent(JsonSerializer.Serialize(ajuste), System.Text.Encoding.UTF8, "application/json");
                var ajusteResponse = await _httpClient.PatchAsync($"{_productosServiceUrl}/{transaccion.ProductoId}", ajusteJson);
                return ajusteResponse.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Detalles del error : {ex.Message}");
                throw;
            }
        }


        public async Task<(bool, string?)> EliminarTransaccionAsync(int transaccionId)
        {
            var transaccion = await _context.Transacciones.FindAsync(transaccionId);
            if (transaccion == null)
                return (false, "Transacción no encontrada.");

            if (transaccion.Eliminado == true)
                return (false, "La transacción ya está eliminada.");

            transaccion.Eliminado = true;
            await _context.SaveChangesAsync();
            return (true, null);
        }
    }
}

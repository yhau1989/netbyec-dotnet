using System.Text.Json;
using TransaccionesService.DTOs;
using TransaccionesService.Models;


namespace TransaccionesService.Services
{
    public class TransaccionService
    {
        private readonly HttpClient _httpClient;
        private readonly string _productosServiceUrl;

        public TransaccionService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _productosServiceUrl = configuration["ProductosServiceUrl"] ?? "";
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
    }
}

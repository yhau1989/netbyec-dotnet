using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransaccionesService.Models;
using TransaccionesService.Data;
using TransaccionesService.Services;

namespace TransaccionesService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransaccionesController : ControllerBase
    {
        private readonly TransaccionesDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly TransaccionService _transaccionService;

        public TransaccionesController(TransaccionesDbContext context, IConfiguration configuration)
        {
            _context = context;
            var httpClient = new HttpClient();
            _httpClient = httpClient;
            _transaccionService = new TransaccionService(httpClient, configuration);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> Get([FromQuery] int? productoId, [FromQuery] string? tipo, [FromQuery] string? fechaInicio, [FromQuery] string? fechaFin)
        {
            var query = _context.Transacciones.AsQueryable();
            if (productoId.HasValue)
                query = query.Where(t => t.ProductoId == productoId.Value);
            if (!string.IsNullOrEmpty(tipo))
            {
                if (Enum.TryParse<TipoTransaccionEnum>(tipo, out var tipoEnum))
                    query = query.Where(t => t.TipoTransaccion == tipoEnum);
                else
                    return BadRequest($"Tipo de transacción inválido: {tipo}");
            }
            // Filtros de fecha
            if (!string.IsNullOrEmpty(fechaInicio) && DateTime.TryParse(fechaInicio, out var inicio))
                query = query.Where(t => t.Fecha >= inicio);
            if (!string.IsNullOrEmpty(fechaFin) && DateTime.TryParse(fechaFin, out var fin))
                query = query.Where(t => t.Fecha <= fin);
            return Ok(await query.ToListAsync());
        }

        [HttpPost]
        public async Task<ActionResult<Transaccion>> Create([FromBody] Transaccion request)
        {
            System.Diagnostics.Debug.WriteLine("Creando transacción:");
            System.Diagnostics.Debug.WriteLine($"Transaccion: {request}");
            // Validación de stock si es venta
            var error = await _transaccionService.ValidarStockAsync(request);
            if (error != null)
                return BadRequest(error);

            // Setear la fecha con la fecha del sistema
            request.Fecha = DateTime.Now;

            // Registrar la transacción
            _context.Transacciones.Add(request);
            await _context.SaveChangesAsync();

            var ok = await _transaccionService.AjustarStockAsync(request);
            if (!ok)
                return BadRequest("No se pudo ajustar el stock del producto.");

            return CreatedAtAction(nameof(Get), new { id = request.Id }, request);
        }
    }
}

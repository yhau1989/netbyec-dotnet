using Microsoft.AspNetCore.Mvc;
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
            _transaccionService = new TransaccionService(httpClient, configuration, context);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> Get([FromQuery] int? productoId, [FromQuery] string? tipo, [FromQuery] string? fechaInicio, [FromQuery] string? fechaFin)
        {
            var (result, error) = await _transaccionService.ObtenerTransaccionesAsync(productoId, tipo, fechaInicio, fechaFin);
            if (error != null)
                return BadRequest(error);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Transaccion>> Create([FromBody] Transaccion request)
        {
            var (transaccion, error) = await _transaccionService.CrearTransaccionAsync(request);
            if (error != null)
                return BadRequest(error);
            return CreatedAtAction(nameof(Get), new { id = transaccion?.Id }, transaccion);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (success, error) = await _transaccionService.EliminarTransaccionAsync(id);
            if (!success)
                return NotFound(error);
            return NoContent();
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Patch(int id, [FromBody] Transaccion request)
        {
            (Transaccion? updated, string? error) = await _transaccionService.ActualizarTransaccionAsync(id, request);
            if (error != null)
                return BadRequest(error);
            if (updated == null)
                return NotFound("Transacción no encontrada.");
            return Ok(updated);
        }
    }
}

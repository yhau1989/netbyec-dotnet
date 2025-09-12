using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductosService.Models;
using ProductosService.Data;
using ProductosService.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProductosService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly ProductoService _productoService;
        public ProductosController(ProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> Get([FromQuery] string? nombre = null, [FromQuery] string? categoria = null)
        {
            var productos = await _productoService.GetProductosAsync(nombre, categoria);
            return Ok(productos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetById(int id)
        {
            var producto = await _productoService.GetProductoByIdAsync(id);
            if (producto == null) return NotFound();
            return Ok(producto);
        }

        [HttpPost]
        public async Task<ActionResult<Producto>> Create([FromBody] Producto producto)
        {
            var created = await _productoService.CreateProductoAsync(producto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Producto producto)
        {
            var updated = await _productoService.UpdateProductoAsync(id, producto);
            if (!updated) return NotFound();
            return NoContent();
        }
        
        [HttpPatch("{id}")]
        public async Task<ActionResult<Producto>> Patch(int id, [FromBody] Dictionary<string, object> fields)
        {
            if (fields == null || fields.Count == 0) return BadRequest();
            var updated = await _productoService.UpdateProductoPartialAsync(id, fields);
            if (!updated) return NotFound();
            var producto = await _productoService.GetProductoByIdAsync(id);
            return Ok(producto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productoService.DeleteProductoAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}

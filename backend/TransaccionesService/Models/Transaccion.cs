using System.ComponentModel.DataAnnotations;

namespace TransaccionesService.Models
{
    public enum TipoTransaccionEnum
    {
        Compra,
        Venta
    }

    public class Transaccion
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        [Required]
        public TipoTransaccionEnum TipoTransaccion { get; set; }
        [Required]
        public int ProductoId { get; set; }
        [Required]
        public int Cantidad { get; set; }
        [Required]
        public decimal PrecioUnitario { get; set; }
        [Required]
        public decimal PrecioTotal { get; set; }
        [Required]
        public string? Detalle { get; set; }
        public bool? Eliminado { get; set; }
    }
}

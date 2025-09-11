namespace TransaccionesService.DTOs
{
    public class ProductoDto
    {
        public int id { get; set; }
        public string? nombre { get; set; }
        public string? descripcion { get; set; }
        public string? categoria { get; set; }
        public string? imagen { get; set; }
        public decimal precio { get; set; }
        public int stock { get; set; }
    }

    public class StockAjusteDto
    {
        public int stock { get; set; }
    }
}

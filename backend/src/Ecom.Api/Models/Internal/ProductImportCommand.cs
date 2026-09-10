namespace Ecom.Api.Models.Internal;

/// <summary>Fully-resolved args for sp_product_import (images already uploaded).</summary>
public sealed record ProductImportCommand(
    string Sku,
    string Name,
    string? Brand,
    string Category,
    string? Subcategory,
    string ProductType,
    decimal Price,
    string? Currency,
    string? Description,
    string? Gender,
    string? Status,
    string MaterialsJson,
    string SizesJson,
    string ImagesJson);

public sealed class ImportOutcome
{
    public int Id { get; set; }
    public string Action { get; set; } = "";
}

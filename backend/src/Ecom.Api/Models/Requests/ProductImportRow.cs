namespace Ecom.Api.Models.Requests;

/// <summary>
/// One row of the import CSV. Header matching strips underscores and lowercases,
/// so `product_type` -> ProductType, `image_urls` -> ImageUrls, etc.
/// </summary>
public sealed class ProductImportRow
{
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public string ProductType { get; set; } = "";
    public string Category { get; set; } = "";
    public string? Subcategory { get; set; }
    public string? Brand { get; set; }
    public decimal Price { get; set; }
    public string? Currency { get; set; }
    public string? Gender { get; set; }
    public string? Status { get; set; }
    public string? Description { get; set; }

    /// <summary>Pipe-separated material names, e.g. "Cotton|Linen".</summary>
    public string? Materials { get; set; }

    /// <summary>Pipe-separated label:stock, e.g. "S:5|M:10".</summary>
    public string? Sizes { get; set; }

    /// <summary>Pipe-separated already-hosted image URLs.</summary>
    public string? ImageUrls { get; set; }

    /// <summary>Pipe-separated file names to pull from the uploaded ZIP.</summary>
    public string? ImageFiles { get; set; }
}

using Ecom.Api.Models.Dtos;

namespace Ecom.Api.Models.Internal;

/// <summary>Head row from sp_product_get (result set 1).</summary>
public sealed class ProductHead
{
    public int Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Currency { get; set; } = "INR";
    public string? Description { get; set; }
    public string Gender { get; set; } = "unisex";
    public string Status { get; set; } = "draft";
    public string? BrandName { get; set; }
    public string CategoryName { get; set; } = "";
    public string? SubcategoryName { get; set; }
}

/// <summary>All four result sets of sp_product_get, assembled by the repository.</summary>
public sealed record ProductDetailData(
    ProductHead Head,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductSizeDto> Sizes,
    IReadOnlyList<string> Materials);

/// <summary>Resolved search args passed from service to repository.</summary>
public sealed record ProductSearchParams(
    string? CategorySlug,
    string? SubcategorySlug,
    string? Gender,
    string? Query,
    string? Status,
    int Limit,
    int Offset);

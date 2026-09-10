using System.Text.Json;
using System.Text.Json.Serialization;

namespace Ecom.Api;

// Types materialized by Dapper are plain classes with settable properties:
// Dapper maps by column name and coerces numeric widths (UNSIGNED INT, SMALLINT,
// TINYINT(1)) into these. Types that the API code constructs itself are records.

// ---- Store config --------------------------------------------------------

public sealed record StoreConfigDto(
    string StoreName,
    string Currency,
    string ActiveLayout,
    bool AiStylistEnabled,
    ThemeDto? Theme);

public sealed record ThemeDto(
    string Name,
    string LayoutType,
    [property: JsonPropertyName("cssVariables")] JsonElement CssVariables);

// ---- Categories ---------------------------------------------------------

public sealed class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string ProductType { get; set; } = "";
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
}

// ---- Products ---------------------------------------------------------

public sealed class ProductListItemDto
{
    public int Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Currency { get; set; } = "INR";
    public string Gender { get; set; } = "unisex";
    public string Status { get; set; } = "draft";
    public string? BrandName { get; set; }
    public string CategoryName { get; set; } = "";
    public string? SubcategoryName { get; set; }
    public string? PrimaryImageUrl { get; set; }
}

public sealed class ProductImageDto
{
    public string Url { get; set; } = "";
    public string? AltText { get; set; }
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public sealed class ProductSizeDto
{
    public string Label { get; set; } = "";
    public string SizeGroup { get; set; } = "generic";
    public int StockQty { get; set; }
}

public sealed record ProductDetailDto(
    int Id,
    string Sku,
    string Name,
    decimal Price,
    string Currency,
    string? Description,
    string Gender,
    string Status,
    string? BrandName,
    string CategoryName,
    string? SubcategoryName,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductSizeDto> Sizes,
    IReadOnlyList<string> Materials);

// ---- Shared ---------------------------------------------------------

public sealed record Paged<T>(IReadOnlyList<T> Items, int Page, int PageSize, long Total)
{
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(Total / (double)PageSize) : 0;
}

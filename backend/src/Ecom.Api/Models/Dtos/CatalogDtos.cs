namespace Ecom.Api.Models.Dtos;

// Materialized by Dapper (proc result-set column aliases are PascalCase to match).

public sealed class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string ProductType { get; set; } = "";
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
}

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

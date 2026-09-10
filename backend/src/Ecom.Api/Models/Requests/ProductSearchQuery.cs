using Microsoft.AspNetCore.Mvc;

namespace Ecom.Api.Models.Requests;

/// <summary>Bound from the query string on GET /api/products via [AsParameters].</summary>
public sealed record ProductSearchQuery
{
    [FromQuery] public string? Category { get; init; }
    [FromQuery] public string? Subcategory { get; init; }
    [FromQuery] public string? Gender { get; init; }
    [FromQuery] public string? Q { get; init; }
    [FromQuery] public string? Status { get; init; }
    [FromQuery] public int? Page { get; init; }
    [FromQuery] public int? PageSize { get; init; }
}

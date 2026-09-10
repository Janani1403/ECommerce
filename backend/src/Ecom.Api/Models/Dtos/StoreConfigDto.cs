using System.Text.Json;
using System.Text.Json.Serialization;

namespace Ecom.Api.Models.Dtos;

public sealed record StoreConfigDto(
    string StoreName,
    string Currency,
    string ActiveLayout,
    bool AiStylistEnabled,
    ThemeDto? Theme);

public sealed record ThemeDto(
    string Key,
    string Name,
    string DefaultLayout,
    [property: JsonPropertyName("cssVariables")] JsonElement CssVariables);

// Materialized by Dapper from sp_themes_list - class with settable props so it
// tolerates the INT UNSIGNED -> int widening.
public sealed class ThemeSummaryDto
{
    public int Id { get; set; }
    public string Key { get; set; } = "";
    public string Name { get; set; } = "";
    public string DefaultLayout { get; set; } = "grid";
}

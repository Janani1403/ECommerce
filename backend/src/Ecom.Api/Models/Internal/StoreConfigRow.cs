namespace Ecom.Api.Models.Internal;

/// <summary>Raw row from sp_store_config_get / sp_store_config_update.</summary>
public sealed class StoreConfigRow
{
    public string StoreName { get; set; } = "";
    public string Currency { get; set; } = "INR";
    public string ActiveLayout { get; set; } = "grid";
    public bool AiStylistEnabled { get; set; }
    public string? ThemeKey { get; set; }
    public string? ThemeName { get; set; }
    public string? ThemeDefaultLayout { get; set; }
    public string? ThemeCssVariables { get; set; }
}

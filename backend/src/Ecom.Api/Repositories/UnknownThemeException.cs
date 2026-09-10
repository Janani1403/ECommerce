namespace Ecom.Api.Repositories;

/// <summary>Thrown when sp_store_config_update is given a theme key that isn't in ui_themes.</summary>
public sealed class UnknownThemeException(string themeKey)
    : Exception($"Unknown theme '{themeKey}'.")
{
    public string ThemeKey { get; } = themeKey;
}

namespace Ecom.Api.Constants;

public static class ApiRoutes
{
    public const string ApiPrefix = "/api";
    public const string Health = "/health";

    public const string StoreConfig = "/store-config";
    public const string Themes = "/themes";

    public const string Categories = "/categories";
    public const string Products = "/products";
    public const string ProductById = "/products/{id:int}";

    // Admin routes are registered under this group (with the admin-token filter);
    // the paths below are relative to it.
    public const string AdminGroup = "/admin";
    public const string AdminProductsImport = "/products/import";
}

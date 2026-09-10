namespace Ecom.Api.Constants;

/// <summary>Names of the MySQL stored procedures. All data access goes through these.</summary>
public static class StoredProcedures
{
    public const string StoreConfigGet = "sp_store_config_get";
    public const string StoreConfigUpdate = "sp_store_config_update";
    public const string ThemesList = "sp_themes_list";

    public const string CategoriesList = "sp_categories_list";
    public const string ProductsSearch = "sp_products_search";
    public const string ProductGet = "sp_product_get";
    public const string ProductImport = "sp_product_import";
}

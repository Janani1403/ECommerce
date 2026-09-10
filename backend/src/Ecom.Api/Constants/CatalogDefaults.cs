namespace Ecom.Api.Constants;

public static class CatalogDefaults
{
    public const int DefaultPageSize = 24;
    public const int MaxPageSize = 100;

    public const string DefaultStatus = "active";
    public const string AllStatusesToken = "all";

    public const string DefaultCurrency = "INR";
    public const string DefaultGender = "unisex";
    public const string DefaultProductStatus = "draft";

    public const string DefaultAdminId = "local-admin";

    public const string UploadsUrlPrefix = "/uploads";
    public const string DefaultPublicBaseUrl = "http://localhost:5056";
}

using Amazon.Lambda.AspNetCoreServer.Hosting;
using Ecom.Api.Api;
using Ecom.Api.Constants;
using Ecom.Api.Data;
using Ecom.Api.Repositories;
using Ecom.Api.Services;
using Ecom.Api.Services.Import;
using Ecom.Api.Storage;
using Microsoft.AspNetCore.Http.Features;

var builder = WebApplication.CreateBuilder(args);

// Runs as a normal Kestrel process locally; as a Lambda behind API Gateway (HTTP
// API) in production. This line is a no-op when not hosted in Lambda.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddOpenApi();

// ---- Data / services -----------------------------------------------------
builder.Services.AddSingleton<Database>();
builder.Services.AddScoped<IStoreConfigRepository, StoreConfigRepository>();
builder.Services.AddScoped<ICatalogRepository, CatalogRepository>();
builder.Services.AddScoped<IProductImportRepository, ProductImportRepository>();
builder.Services.AddScoped<IStoreConfigService, StoreConfigService>();
builder.Services.AddScoped<ICatalogService, CatalogService>();
builder.Services.AddScoped<IProductImportService, ProductImportService>();

// Image storage: local disk in dev, S3 in prod.
if (string.Equals(builder.Configuration[ConfigKeys.StorageProvider], "s3", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddSingleton<IBlobStore, S3BlobStore>();
else
    builder.Services.AddSingleton<IBlobStore, LocalBlobStore>();

builder.Services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = 100L * 1024 * 1024);

// ---- CORS --------------------------------------------------------------
const string CorsPolicy = "spa";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, policy =>
{
    var origins = builder.Configuration.GetSection(ConfigKeys.AllowedCorsOrigins).Get<string[]>()
                  ?? ["http://localhost:5173"];
    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseStaticFiles();   // serves wwwroot/uploads for LocalBlobStore
app.UseCors(CorsPolicy);

app.MapHealthEndpoints();

var api = app.MapGroup(ApiRoutes.ApiPrefix);
api.MapStoreConfigEndpoints();
api.MapCatalogEndpoints();
api.MapAdminEndpoints();

app.Run();

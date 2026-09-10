using Amazon.Lambda.AspNetCoreServer.Hosting;
using Ecom.Api.Api;
using Ecom.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Runs as a normal Kestrel process locally; as a Lambda behind API Gateway (HTTP API)
// in production. This line is a no-op when the app is not hosted in Lambda.
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddOpenApi();
builder.Services.AddSingleton<Database>();

const string CorsPolicy = "spa";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, policy =>
{
    var origins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>()
                  ?? ["http://localhost:5173"];
    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors(CorsPolicy);

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

var api = app.MapGroup("/api");
api.MapStoreConfig();
api.MapCatalog();

app.Run();

using NurseCall.Web.Data;
using NurseCall.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<CodacoDb>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<EndpointService>();
builder.Services.AddScoped<ViewerService>();
builder.Services.AddScoped<HistoryService>();
builder.Services.AddScoped<CallService>();
builder.Services.AddScoped<PresenceService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/departments", async (DepartmentService service) =>
{
    var departments = await service.GetAllAsync();
    return Results.Ok(departments);
});

app.MapGet("/api/endpoints", async (EndpointService service) =>
{
    var endpoints = await service.GetAllAsync();
    return Results.Ok(endpoints);
});

app.MapGet("/api/viewer", async (ViewerService service) =>
{
    var viewer = await service.GetAsync();
    return Results.Ok(viewer);
});

app.MapGet("/api/history", async (HistoryService service) =>
{
    var history = await service.GetRecentAsync(50);
    return Results.Ok(history);
});

app.MapGet("/api/calls", async (CallService service) =>
{
    var calls = await service.GetActiveAsync();
    return Results.Ok(calls);
});

app.MapGet("/api/presence", async (PresenceService service) =>
{
    var presence = await service.GetActiveAsync();
    return Results.Ok(presence);
});

app.Run();
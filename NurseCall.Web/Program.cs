using NurseCall.Web.Data;
using NurseCall.Web.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<CodacoDb>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<EndpointService>();
builder.Services.AddScoped<ViewerService>();
builder.Services.AddScoped<HistoryService>();

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
    var snapshot = await service.GetRawSnapshotAsync();
    return Results.Text(snapshot, "text/plain");
});

app.MapGet("/api/history", async (HistoryService service) =>
{
    var history = await service.GetRecentAsync(50);
    return Results.Ok(history);
});

app.MapGet("/api/calls", async (CodacoDb db) =>
{
    const string sql = """
        SELECT
            idSegment,
            idDepartment,
            Room,
            Bed,
            TypeOfCall,
            OrderIndex,
            Priority,
            CallerIp,
            CallerTextA,
            CallerTextB,
            CallerExtBed,
            PriorityCare,
            NeatATOM_Event,
            NeatATOM_Id,
            AccesorEvent,
            AccesorButtonId
        FROM Calls
        ORDER BY Priority DESC, OrderIndex ASC;
        """;

    var result = await db.QueryAsync(sql);

    return Results.Text(result, "text/plain");
});

app.Run();
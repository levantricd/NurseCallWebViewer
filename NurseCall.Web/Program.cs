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
builder.Services.AddScoped<HardwareService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/departments",
    async (DepartmentService service) =>
    {
        var departments =
            await service.GetAllAsync();

        return Results.Ok(departments);
    });

app.MapGet("/api/endpoints",
    async (EndpointService service) =>
    {
        var endpoints =
            await service.GetAllAsync();

        return Results.Ok(endpoints);
    });

app.MapGet("/api/viewer",
    async (ViewerService service) =>
    {
        var viewer =
            await service.GetAsync();

        return Results.Ok(viewer);
    });

app.MapGet("/api/history",
    async (
        HistoryService service,
        int? idSegment,
        int? idDepartment,
        int? room,
        string? fromDate,
        string? toDate) =>
    {
        var history =
            await service.GetFilteredAsync(
                idSegment,
                idDepartment,
                room,
                fromDate,
                toDate,
                10000);

        return Results.Ok(history);
    });

app.MapGet("/api/history/export",
    async (
        HistoryService service,
        int? idSegment,
        int? idDepartment,
        int? room,
        string? fromDate,
        string? toDate) =>
    {
        var file =
            await service.ExportExcelAsync(
                idSegment,
                idDepartment,
                room,
                fromDate,
                toDate);

        var filename =
            $"NurseCall_History_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return Results.File(
            file,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename);
    });

app.MapGet("/api/calls",
    async (CallService service) =>
    {
        var calls =
            await service.GetActiveAsync();

        return Results.Ok(calls);
    });

app.MapGet("/api/presence",
    async (PresenceService service) =>
    {
        var presence =
            await service.GetActiveAsync();

        return Results.Ok(presence);
    });

app.MapGet("/api/hardware",
    async (HardwareService service) =>
    {
        var hardware =
            await service.GetAllAsync();

        return Results.Ok(hardware);
    });

app.Run();
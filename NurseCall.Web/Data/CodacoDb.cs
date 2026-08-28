using System.Diagnostics;
using MySql.Data.MySqlClient;

namespace NurseCall.Web.Data;

public class CodacoDb
{
    private readonly IConfiguration _configuration;

    public CodacoDb(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> QueryAsync(string sql)
    {
        var connectionString =
            _configuration.GetConnectionString("CodacoNC")
            ?? throw new InvalidOperationException(
                "Connection string CodacoNC chua du?c c?u hình.");

        var cs = new MySqlConnectionStringBuilder(connectionString);

        var psi = new ProcessStartInfo
        {
            FileName = @"C:\mysql57\bin\mysql.exe",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        psi.ArgumentList.Add("--protocol=TCP");
        psi.ArgumentList.Add("-h");
        psi.ArgumentList.Add(cs.Server);
        psi.ArgumentList.Add("-P");
        psi.ArgumentList.Add(cs.Port.ToString());
        psi.ArgumentList.Add("-u");
        psi.ArgumentList.Add(cs.UserID);
        psi.ArgumentList.Add("-D");
        psi.ArgumentList.Add(cs.Database);
        psi.ArgumentList.Add("--batch");
        psi.ArgumentList.Add("--raw");
        psi.ArgumentList.Add("-e");
        psi.ArgumentList.Add(sql);

        psi.Environment["MYSQL_PWD"] = cs.Password;

        using var process = Process.Start(psi)
            ?? throw new InvalidOperationException(
                "Không th? kh?i d?ng mysql.exe.");

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        await process.WaitForExitAsync();

        var output = await outputTask;
        var error = await errorTask;

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException(
                $"mysql.exe tr? v? l?i {process.ExitCode}: {error}");
        }

        return output;
    }
}

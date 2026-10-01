import os from "os";
import chalk from "chalk";
import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function infoSistema(): Promise<void> {
  console.log(chalk.cyan("=== Sistema Operacional ==="));
  console.log(`Hostname: ${os.hostname()}`);
  console.log(`Plataforma: ${os.platform()} (${os.arch()})`);
  console.log(`Versão do SO: ${os.release()}`);
  console.log(`Uptime: ${(os.uptime() / 3600).toFixed(1)} horas`);

  console.log(chalk.cyan("\n=== CPU ==="));
  const cpus = os.cpus();
  console.log(`Modelo: ${cpus[0]?.model ?? "desconhecido"}`);
  console.log(`Núcleos: ${cpus.length}`);

  console.log(chalk.cyan("\n=== Memória ==="));
  const totalGB = (os.totalmem() / 1024 ** 3).toFixed(1);
  const livreGB = (os.freemem() / 1024 ** 3).toFixed(1);
  console.log(`Total: ${totalGB} GB`);
  console.log(`Livre: ${livreGB} GB`);

  if (garantirWindows()) {
    await rodarEMostrar(
      'powershell -Command "Get-CimInstance Win32_DiskDrive | Select-Object Model,@{N=\'SizeGB\';E={[math]::Round($_.Size/1GB,1)}} | Format-Table -AutoSize"',
      "Consultando discos..."
    );
  }
}

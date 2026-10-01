import os from "os";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface InfoEstatica {
  cpuNome: string;
  cpuNucleosFisicos: number;
  cpuNucleosLogicos: number;
  cpuClockGHz: number;
  gpuNome: string | null;
  gpuRamGiB: number | null;
  swapTotalGiB: number | null;
  discos: { letra: string; totalGiB: number; usadoGiB: number }[];
}

export interface InfoDinamica {
  ramTotalGiB: number;
  ramUsadaGiB: number;
  uptimeTexto: string;
  dataAtual: string;
}

/**
 * Coleta dados que não mudam durante a execução (CPU, GPU, discos).
 * Faz uma única chamada ao PowerShell/WMI — é um pouco mais lenta,
 * então deve ser chamada só uma vez e guardada em cache.
 */
export async function coletarInfoEstatica(): Promise<InfoEstatica> {
  const cpus = os.cpus();

  let cpuNome = (cpus[0]?.model ?? "Desconhecido").trim();
  let cpuNucleosLogicos = cpus.length;
  let cpuNucleosFisicos = cpuNucleosLogicos;
  let cpuClockGHz = (cpus[0]?.speed ?? 0) / 1000;
  let gpuNome: string | null = null;
  let gpuRamGiB: number | null = null;
  let swapTotalGiB: number | null = null;
  let discos: InfoEstatica["discos"] = [];

  if (process.platform === "win32") {
    const script = `
$ErrorActionPreference = "SilentlyContinue"
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1 NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed
$gpu = Get-CimInstance Win32_VideoController | Where-Object { $_.AdapterRAM -gt 0 } | Select-Object -First 1 Name,AdapterRAM
$disks = @(Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID,Size,FreeSpace)
$page = Get-CimInstance Win32_PageFileUsage | Select-Object -First 1 AllocatedBaseSize
[PSCustomObject]@{ cpu=$cpu; gpu=$gpu; disks=$disks; page=$page } | ConvertTo-Json -Depth 5 -Compress
`.trim();

    const caminhoTemp = path.join(os.tmpdir(), `orange-lily-${Date.now()}.ps1`);

    try {
      fs.writeFileSync(caminhoTemp, script, "utf8");
      const { stdout } = await execAsync(
        `powershell -NoProfile -ExecutionPolicy Bypass -File "${caminhoTemp}"`,
        { maxBuffer: 1024 * 1024 * 10 }
      );
      const dados = JSON.parse(stdout || "{}");

      if (dados.cpu) {
        cpuNucleosFisicos = dados.cpu.NumberOfCores ?? cpuNucleosFisicos;
        cpuNucleosLogicos = dados.cpu.NumberOfLogicalProcessors ?? cpuNucleosLogicos;
        if (dados.cpu.MaxClockSpeed) cpuClockGHz = dados.cpu.MaxClockSpeed / 1000;
      }

      if (dados.gpu) {
        gpuNome = dados.gpu.Name ?? null;
        gpuRamGiB = dados.gpu.AdapterRAM ? dados.gpu.AdapterRAM / 1024 ** 3 : null;
      }

      if (dados.page?.AllocatedBaseSize) {
        swapTotalGiB = dados.page.AllocatedBaseSize / 1024;
      }

      const listaDiscos = Array.isArray(dados.disks)
        ? dados.disks
        : dados.disks
        ? [dados.disks]
        : [];

      discos = listaDiscos
        .filter((d: any) => d?.Size)
        .map((d: any) => ({
          letra: d.DeviceID,
          totalGiB: d.Size / 1024 ** 3,
          usadoGiB: (d.Size - (d.FreeSpace ?? 0)) / 1024 ** 3,
        }));
    } catch {
      // Em caso de falha, segue com os valores padrão do Node (os.cpus()).
    } finally {
      fs.unlink(caminhoTemp, () => {});
    }
  }

  return {
    cpuNome,
    cpuNucleosFisicos,
    cpuNucleosLogicos,
    cpuClockGHz,
    gpuNome,
    gpuRamGiB,
    swapTotalGiB,
    discos,
  };
}

/** Dados que mudam a cada execução (RAM livre, uptime, data/hora). Instantâneo, sem subprocesso. */
export function coletarInfoDinamica(): InfoDinamica {
  const ramTotalGiB = os.totalmem() / 1024 ** 3;
  const ramLivreGiB = os.freemem() / 1024 ** 3;
  const ramUsadaGiB = ramTotalGiB - ramLivreGiB;

  const uptimeSegundos = os.uptime();
  const horas = Math.floor(uptimeSegundos / 3600);
  const minutos = Math.floor((uptimeSegundos % 3600) / 60);

  return {
    ramTotalGiB,
    ramUsadaGiB,
    uptimeTexto: `${horas}h ${minutos}min`,
    dataAtual: new Date().toLocaleString("pt-BR"),
  };
}

import chalk from "chalk";
import inquirer from "inquirer";
import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";
import { abrirOuBaixar } from "../../utils/abrirPrograma.js";

export async function saudeDisco(): Promise<void> {
  if (!garantirWindows()) return;

  console.log(chalk.cyan("=== Diagnóstico nativo do Windows (SMART) ===\n"));

  await rodarEMostrar(
    'powershell -Command "Get-PhysicalDisk | Select-Object FriendlyName,HealthStatus,OperationalStatus,MediaType | Format-Table -AutoSize; Get-PhysicalDisk | Get-StorageReliabilityCounter | Select-Object DeviceId,Temperature,Wear,ReadErrorsTotal | Format-Table -AutoSize"',
    "Consultando contadores de confiabilidade (SMART) nativos..."
  );

  const { abrir } = await inquirer.prompt([
    {
      type: "confirm",
      name: "abrir",
      message: "Quer abrir o CrystalDiskInfo para uma análise mais detalhada?",
      default: false,
    },
  ]);

  if (!abrir) return;

  await abrirOuBaixar({
    nomeExibicao: "CrystalDiskInfo",
    nomesExecutaveis: ["DiskInfo64.exe", "DiskInfo32.exe", "DiskInfo.exe"],
    caminhosComuns: [
      "C:\\Program Files\\CrystalDiskInfo\\DiskInfo64.exe",
      "C:\\Program Files (x86)\\CrystalDiskInfo\\DiskInfo64.exe",
      "C:\\Program Files\\CrystalDiskInfo\\DiskInfo32.exe",
      "C:\\Program Files (x86)\\CrystalDiskInfo\\DiskInfo32.exe",
    ],
    urlDownload: "https://crystalmark.info/en/software/crystaldiskinfo/",
  });
}

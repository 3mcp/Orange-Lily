import chalk from "chalk";
import inquirer from "inquirer";
import { executarComando, garantirWindows } from "../../utils/executarComando.js";
import { abrirOuBaixar } from "../../utils/abrirPrograma.js";

export async function diagnosticoTemperatura(): Promise<void> {
  if (!garantirWindows()) return;

  console.log(chalk.cyan("=== Diagnóstico nativo do Windows (WMI) ===\n"));
  console.log(chalk.gray("Tentando ler sensores de temperatura nativos...\n"));

  let encontrouDadosNativos = false;

  try {
    const saida = await executarComando(
      'powershell -Command "Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature | Select-Object InstanceName,CurrentTemperature"'
    );

    if (saida.trim() && /\d/.test(saida)) {
      console.log(saida.trim());
      console.log(
        chalk.gray(
          "\n(Valor em décimos de Kelvin — subtraia 2732 e divida por 10 para obter °C. Ex: 3000 = 26,8°C)"
        )
      );
      encontrouDadosNativos = true;
    }
  } catch {
    // segue para o aviso abaixo
  }

  if (!encontrouDadosNativos) {
    console.log(
      chalk.yellow(
        "Esta placa-mãe/driver não expõe temperatura pelo WMI nativo do Windows (é comum — a maioria não expõe)."
      )
    );
  }

  const { abrir } = await inquirer.prompt([
    {
      type: "confirm",
      name: "abrir",
      message: "Quer abrir o HWiNFO para uma leitura completa de temperatura (CPU/GPU/discos)?",
      default: !encontrouDadosNativos,
    },
  ]);

  if (!abrir) return;

  await abrirOuBaixar({
    nomeExibicao: "HWiNFO",
    nomesExecutaveis: ["HWiNFO64.exe", "HWiNFO32.exe"],
    caminhosComuns: [
      "C:\\Program Files\\HWiNFO64\\HWiNFO64.exe",
      "C:\\Program Files (x86)\\HWiNFO64\\HWiNFO64.exe",
      "C:\\Program Files\\HWiNFO32\\HWiNFO32.exe",
      "C:\\Program Files (x86)\\HWiNFO32\\HWiNFO32.exe",
    ],
    urlDownload: "https://www.hwinfo.com/download/",
  });
}

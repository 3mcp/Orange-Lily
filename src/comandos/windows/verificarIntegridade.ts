import chalk from "chalk";
import inquirer from "inquirer";
import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function verificarIntegridade(): Promise<void> {
  if (!garantirWindows()) return;

  const { confirmar } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmar",
      message: chalk.yellow(
        "O sfc /scannow demora alguns minutos e precisa do terminal como Administrador. Continuar?"
      ),
      default: false,
    },
  ]);

  if (!confirmar) {
    console.log(chalk.gray("Cancelado."));
    return;
  }

  await rodarEMostrar("sfc /scannow", "Verificando integridade dos arquivos do sistema (aguarde)...");
}

import chalk from "chalk";
import inquirer from "inquirer";
import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function limparTemp(): Promise<void> {
  if (!garantirWindows()) return;

  const { confirmar } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmar",
      message: chalk.yellow("Isso vai apagar os arquivos temporários do usuário atual. Continuar?"),
      default: false,
    },
  ]);

  if (!confirmar) {
    console.log(chalk.gray("Cancelado."));
    return;
  }

  await rodarEMostrar(
    'powershell -Command "Remove-Item -Path $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue; Write-Host \'Concluído.\'"',
    "Limpando temporários..."
  );
}

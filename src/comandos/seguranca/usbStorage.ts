import chalk from "chalk";
import inquirer from "inquirer";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CHAVE = "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR";

async function definirValor(valor: "3" | "4"): Promise<void> {
  const comando = `reg add "${CHAVE}" /v Start /t REG_DWORD /d ${valor} /f`;
  await execAsync(comando);
}

export async function usbStorage(): Promise<void> {
  if (process.platform !== "win32") {
    console.log(chalk.red("Esse comando só funciona no Windows."));
    return;
  }

  const { acao } = await inquirer.prompt([
    {
      type: "list",
      name: "acao",
      message: "O que deseja fazer com o armazenamento USB?",
      choices: [
        "Bloquear (pendrives/HDs externos param de funcionar)",
        "Desbloquear (volta ao normal)",
        "Cancelar",
      ],
    },
  ]);

  if (acao.startsWith("Cancelar")) return;

  const { confirmar } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmar",
      message: chalk.yellow(
        "Isso precisa do terminal aberto como Administrador e vai exigir reiniciar o PC para valer. Continuar?"
      ),
      default: false,
    },
  ]);

  if (!confirmar) {
    console.log(chalk.gray("Cancelado."));
    return;
  }

  try {
    if (acao.startsWith("Bloquear")) {
      await definirValor("4");
      console.log(chalk.green("✔ USB storage bloqueado. Reinicie o PC para aplicar."));
    } else {
      await definirValor("3");
      console.log(chalk.green("✔ USB storage desbloqueado. Reinicie o PC para aplicar."));
    }
  } catch (erro: any) {
    console.log(chalk.red("✘ Falhou. Confirme que o terminal está como Administrador."));
    console.log(chalk.gray(erro.message));
  }
}

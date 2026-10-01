import inquirer from "inquirer";
import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function testarConectividade(): Promise<void> {
  if (!garantirWindows()) return;

  const { host } = await inquirer.prompt([
    {
      type: "input",
      name: "host",
      message: "Endereço para testar (ex: 8.8.8.8 ou google.com):",
      default: "8.8.8.8",
    },
  ]);

  await rodarEMostrar(`ping -n 4 ${host}`, `Testando conexão com ${host}...`);
}

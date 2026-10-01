import fs from "fs";
import path from "path";
import chalk from "chalk";
import { executarComando, garantirWindows } from "../../utils/executarComando.js";

export async function programasInstalados(): Promise<void> {
  if (!garantirWindows()) return;

  console.log(chalk.gray("\nListando programas instalados (pode levar alguns segundos)...\n"));

  const comando =
    'powershell -Command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object { $_.DisplayName } | Select-Object DisplayName,DisplayVersion | Sort-Object DisplayName | Format-Table -AutoSize"';

  try {
    const saida = await executarComando(comando);
    const nomeArquivo = `programas-instalados-${Date.now()}.txt`;
    const destino = path.join(process.cwd(), nomeArquivo);
    fs.writeFileSync(destino, saida, "utf8");

    console.log(saida.split("\n").slice(0, 25).join("\n"));
    console.log(chalk.gray("... (lista completa salva em arquivo)"));
    console.log(chalk.green(`\n✔ Lista completa salva em: ${destino}`));
  } catch (erro: any) {
    console.log(chalk.red("✘ Erro ao listar programas:"), erro.toString());
  }
}

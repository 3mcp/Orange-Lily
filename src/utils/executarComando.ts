import { exec } from "child_process";
import chalk from "chalk";

export function executarComando(comando: string): Promise<string> {
  // "chcp 65001" força o console do Windows a usar UTF-8 nesse processo,
  // evitando acentuação quebrada (á, ç, é, etc.) na saída de comandos
  // como ping, ipconfig, sfc, etc.
  const comandoComUtf8 =
    process.platform === "win32" ? `chcp 65001 >nul && ${comando}` : comando;

  return new Promise((resolve, reject) => {
    exec(
      comandoComUtf8,
      { encoding: "utf8", maxBuffer: 1024 * 1024 * 20, windowsHide: true },
      (erro, stdout, stderr) => {
        if (erro && !stdout) return reject(stderr || erro.message);
        resolve((stdout || stderr || "").toString());
      }
    );
  });
}

export async function rodarEMostrar(comando: string, tituloLoading = "Executando..."): Promise<void> {
  console.log(chalk.gray(`\n${tituloLoading}\n`));
  try {
    const saida = await executarComando(comando);
    console.log(saida.trim() || chalk.gray("(sem saída)"));
  } catch (erro: any) {
    console.log(chalk.red("✘ Erro ao executar comando:"));
    console.log(chalk.gray(erro.toString()));
  }
}

export function garantirWindows(): boolean {
  if (process.platform !== "win32") {
    console.log(chalk.red("Esse comando só funciona no Windows."));
    return false;
  }
  return true;
}

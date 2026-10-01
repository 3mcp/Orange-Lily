import chalk from "chalk";
import fs from "fs";

export async function listarArquivos(): Promise<void> {
  const arquivos = fs.readdirSync(".");
  arquivos.forEach((f) => console.log(chalk.yellow(f)));
}

import crypto from "crypto";
import chalk from "chalk";
import inquirer from "inquirer";

const CARACTERES =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

export async function gerarSenha(): Promise<void> {
  const { tamanho, quantidade } = await inquirer.prompt([
    {
      type: "number",
      name: "tamanho",
      message: "Tamanho da senha:",
      default: 16,
    },
    {
      type: "number",
      name: "quantidade",
      message: "Quantas senhas gerar:",
      default: 1,
    },
  ]);

  console.log("");
  for (let i = 0; i < quantidade; i++) {
    let senha = "";
    for (let j = 0; j < tamanho; j++) {
      const indice = crypto.randomInt(0, CARACTERES.length);
      senha += CARACTERES[indice];
    }
    console.log(chalk.green(senha));
  }
}

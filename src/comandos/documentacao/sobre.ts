import chalk from "chalk";

export async function sobre(): Promise<void> {
  console.log(chalk.cyan("=== Sobre o Orange Lily ==="));
  console.log("Toolkit de suporte técnico em terminal.");
  console.log("Edite este texto em src/comandos/documentacao/sobre.ts");
  console.log("");
  console.log(chalk.gray("Para adicionar um novo comando:"));
  console.log(chalk.gray("1. Crie um arquivo na pasta da categoria certa em src/comandos/"));
  console.log(chalk.gray("2. Exporte uma função async"));
  console.log(chalk.gray("3. Registre em src/categorias/index.ts"));
}

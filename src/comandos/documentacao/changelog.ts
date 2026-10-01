import chalk from "chalk";

export async function changelog(): Promise<void> {
  console.log(chalk.cyan("=== Changelog ==="));
  console.log("Edite este arquivo em src/comandos/documentacao/changelog.ts");
  console.log("conforme for adicionando funcionalidades novas.\n");
  console.log("- v1.0.0: estrutura inicial com menu por categorias");
}

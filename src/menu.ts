import chalk from "chalk";
import inquirer from "inquirer";
import { registrarCategorias } from "./categorias/index.js";
import { montarDashboard } from "./dashboard.js";
import { coletarInfoEstatica, InfoEstatica } from "./sistema/coletarInfoSistema.js";

const categorias = registrarCategorias();

let infoEstaticaCache: InfoEstatica | null = null;

async function obterInfoEstatica(): Promise<InfoEstatica> {
  if (!infoEstaticaCache) {
    console.log(chalk.gray("Carregando informações do sistema..."));
    infoEstaticaCache = await coletarInfoEstatica();
  }
  return infoEstaticaCache;
}

async function pausar(): Promise<void> {
  await inquirer.prompt([
    { type: "input", name: "continuar", message: "\nPressione Enter para continuar..." },
  ]);
}

async function menuComandos(indiceCategoria: number): Promise<void> {
  const categoria = categorias[indiceCategoria];

  console.clear();
  console.log(chalk.cyanBright.bold(`=== ${categoria.nome} ===\n`));

  const { escolha } = await inquirer.prompt([
    {
      type: "list",
      name: "escolha",
      message: "Escolha uma opção:",
      choices: [
        ...categoria.comandos.map((c, i) => `${i + 1} - ${c.nome}`),
        new inquirer.Separator(),
        "0 - Voltar",
      ],
    },
  ]);

  if (escolha.startsWith("0")) {
    await menuPrincipal();
    return;
  }

  const indiceComando = parseInt(escolha.split(" - ")[0]) - 1;

  try {
    await categoria.comandos[indiceComando].executar();
  } catch (erro) {
    console.error(chalk.red("\nErro ao executar comando:"), erro);
  }

  await pausar();
  await menuComandos(indiceCategoria);
}

export async function menuPrincipal(): Promise<void> {
  const estatica = await obterInfoEstatica();

  console.clear();
  console.log(montarDashboard(estatica));
  console.log("");

  const { escolha } = await inquirer.prompt([
    {
      type: "list",
      name: "escolha",
      message: "Escolha uma categoria:",
      choices: [
        ...categorias.map((c, i) => `${i + 1} - ${c.nome}`),
        new inquirer.Separator(),
        "0 - Sair",
      ],
    },
  ]);

  if (escolha.startsWith("0")) {
    console.log(chalk.gray("\nAté mais!"));
    process.exit(0);
  }

  const indice = parseInt(escolha.split(" - ")[0]) - 1;
  await menuComandos(indice);
}

export async function iniciarMenu(): Promise<void> {
  await menuPrincipal();
}

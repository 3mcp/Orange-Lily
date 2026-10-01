import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import chalk from "chalk";
import inquirer from "inquirer";

const execAsync = promisify(exec);

/**
 * Cria um link clicável no terminal (funciona no Windows Terminal, VS Code,
 * e a maioria dos terminais modernos). Em terminais sem suporte, o próprio
 * terminal costuma mostrar a URL normalmente como texto.
 */
export function linkClicavel(url: string, texto: string = url): string {
  return `\u001B]8;;${url}\u0007${chalk.underline.cyan(texto)}\u001B]8;;\u0007`;
}

/**
 * Tenta localizar um executável:
 * 1. Procura no PATH do sistema (comando `where`)
 * 2. Procura em uma lista de caminhos de instalação comuns
 * Retorna o caminho encontrado, ou null se não encontrar.
 */
export async function localizarExecutavel(
  nomesExecutaveis: string[],
  caminhosComuns: string[] = []
): Promise<string | null> {
  for (const nome of nomesExecutaveis) {
    try {
      const { stdout } = await execAsync(`where ${nome}`);
      const primeiraLinha = stdout
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find(Boolean);
      if (primeiraLinha) return primeiraLinha;
    } catch {
      // não encontrado no PATH, segue tentando os próximos
    }
  }

  for (const caminho of caminhosComuns) {
    if (fs.existsSync(caminho)) return caminho;
  }

  return null;
}

export interface OpcoesAbrirOuBaixar {
  nomeExibicao: string;
  nomesExecutaveis: string[];
  caminhosComuns?: string[];
  urlDownload: string;
}

/**
 * Tenta abrir um programa já instalado. Se não encontrar, mostra um link
 * clicável para baixar a versão mais recente.
 */
export async function abrirOuBaixar(opcoes: OpcoesAbrirOuBaixar): Promise<void> {
  console.log(chalk.gray(`\nProcurando ${opcoes.nomeExibicao} nesta máquina...`));

  const caminho = await localizarExecutavel(
    opcoes.nomesExecutaveis,
    opcoes.caminhosComuns ?? []
  );

  if (caminho) {
    console.log(chalk.green(`✔ Encontrado em: ${caminho}`));
    console.log(chalk.gray("Abrindo..."));
    exec(`start "" "${caminho}"`);
    return;
  }

  console.log(chalk.yellow(`✘ ${opcoes.nomeExibicao} não foi encontrado nesta máquina.`));

  const { opcao } = await inquirer.prompt([
    {
      type: "list",
      name: "opcao",
      message: "O que deseja fazer?",
      choices: [
        "Já tenho uma versão portátil (.exe) em algum lugar — informar o caminho",
        "Baixar a versão mais recente (abre o link)",
        "Cancelar",
      ],
    },
  ]);

  if (opcao.startsWith("Já tenho")) {
    const { caminhoManual } = await inquirer.prompt([
      {
        type: "input",
        name: "caminhoManual",
        message: "Cole o caminho completo do .exe (ex: D:\\Portateis\\HWiNFO64.exe):",
      },
    ]);

    const limpo = (caminhoManual || "").trim().replace(/^"|"$/g, "");

    if (!limpo || !fs.existsSync(limpo)) {
      console.log(chalk.red("Caminho inválido ou arquivo não encontrado."));
      return;
    }

    console.log(chalk.gray("Abrindo..."));
    exec(`start "" "${limpo}"`);
    return;
  }

  if (opcao.startsWith("Baixar")) {
    console.log(`Baixe a versão mais recente aqui: ${linkClicavel(opcoes.urlDownload)}`);
    return;
  }

  console.log(chalk.gray("Cancelado."));
}

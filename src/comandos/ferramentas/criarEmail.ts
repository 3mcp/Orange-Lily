import chalk from "chalk";
import inquirer from "inquirer";

export async function criarEmail(): Promise<void> {
  const respostas = await inquirer.prompt([
    { type: "input", name: "nome", message: "Nome do e-mail (ex: joao.silva):" },
    { type: "password", name: "senha", message: "Senha:", mask: "*" },
  ]);

  console.log(chalk.blue(`\nCriando e-mail para "${respostas.nome}"...`));

  // TODO: plugar aqui a lógica real de criação
  // - Se houver API do painel (cPanel/Plesk/Zimbra/Workspace): chamada HTTP com fetch/axios
  // - Se não houver API: automação de navegador com Playwright/Puppeteer

  console.log(chalk.green("✔ (placeholder) E-mail criado com sucesso!"));
}

import os from "os";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { executarComando, garantirWindows } from "../../utils/executarComando.js";

export async function relatorioMaquina(): Promise<void> {
  console.log(chalk.gray("\nColetando informações...\n"));

  const linhas: string[] = [];
  linhas.push(`Relatório gerado em: ${new Date().toLocaleString("pt-BR")}`);
  linhas.push(`Hostname: ${os.hostname()}`);
  linhas.push(`Usuário: ${os.userInfo().username}`);
  linhas.push(`Plataforma: ${os.platform()} ${os.release()} (${os.arch()})`);
  linhas.push(`CPU: ${os.cpus()[0]?.model ?? "desconhecido"}`);
  linhas.push(`Memória total: ${(os.totalmem() / 1024 ** 3).toFixed(1)} GB`);

  if (garantirWindows()) {
    try {
      const ip = await executarComando(
        'powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch \'Loopback\'}).IPAddress"'
      );
      linhas.push(`IP(s): ${ip.trim().split(/\s+/).join(", ")}`);
    } catch {
      linhas.push("IP(s): não foi possível obter");
    }
  }

  const conteudo = linhas.join("\n");
  console.log(conteudo);

  const nomeArquivo = `relatorio-${os.hostname()}-${Date.now()}.txt`;
  const destino = path.join(process.cwd(), nomeArquivo);
  fs.writeFileSync(destino, conteudo, "utf8");

  console.log(chalk.green(`\n✔ Relatório salvo em: ${destino}`));
}

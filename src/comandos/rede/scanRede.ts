import os from "os";
import chalk from "chalk";
import { exec } from "child_process";
import { promisify } from "util";
import { executarComando, garantirWindows } from "../../utils/executarComando.js";

const execAsync = promisify(exec);

function obterRedeLocal(): { baseRede: string; meuIp: string } | null {
  const interfaces = os.networkInterfaces();

  for (const nome of Object.keys(interfaces)) {
    for (const iface of interfaces[nome] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        const partes = iface.address.split(".");
        const baseRede = partes.slice(0, 3).join(".");
        return { baseRede, meuIp: iface.address };
      }
    }
  }

  return null;
}

export async function scanRede(): Promise<void> {
  if (!garantirWindows()) return;

  const rede = obterRedeLocal();
  if (!rede) {
    console.log(chalk.red("Não foi possível detectar a rede local."));
    return;
  }

  console.log(chalk.gray(`Seu IP: ${rede.meuIp}`));
  console.log(
    chalk.gray(`Escaneando a rede ${rede.baseRede}.0/24 (pode levar de 10 a 30 segundos)...\n`)
  );

  const varreduras: Promise<unknown>[] = [];
  for (let i = 1; i <= 254; i++) {
    const alvo = `${rede.baseRede}.${i}`;
    varreduras.push(execAsync(`ping -n 1 -w 150 ${alvo}`).catch(() => null));
  }
  await Promise.all(varreduras);

  const tabelaArp = await executarComando("arp -a");
  const linhasDispositivos = tabelaArp
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        /^\d+\.\d+\.\d+\.\d+/.test(l) &&
        !l.includes("255.255.255.255") &&
        !l.startsWith("224.") &&
        !l.includes("ff-ff-ff-ff-ff-ff")
    );

  if (linhasDispositivos.length === 0) {
    console.log(chalk.yellow("Nenhum dispositivo encontrado."));
    return;
  }

  console.log(chalk.cyan("Endereço IP        Endereço físico (MAC)   Tipo"));
  linhasDispositivos.forEach((linha) => console.log(linha));

  console.log(chalk.green(`\n✔ ${linhasDispositivos.length} dispositivo(s) encontrados.`));
  console.log(
    chalk.gray(
      "(Baseado na tabela ARP após o ping sweep — dispositivos com firewall que bloqueia ping podem não aparecer.)"
    )
  );
}

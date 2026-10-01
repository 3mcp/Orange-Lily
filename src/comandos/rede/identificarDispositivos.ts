import os from "os";
import https from "https";
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
        return { baseRede: partes.slice(0, 3).join("."), meuIp: iface.address };
      }
    }
  }

  return null;
}

/** IPs de multicast (224.0.0.0–239.255.255.255) não são dispositivos de verdade. */
function ehMulticast(ip: string): boolean {
  const primeiroOcteto = parseInt(ip.split(".")[0], 10);
  return primeiroOcteto >= 224 && primeiroOcteto <= 239;
}

/**
 * Detecta se o MAC é "aleatorizado" (locally administered) — recurso de
 * privacidade que iPhones e Androids modernos usam por padrão em redes Wi-Fi.
 * Quando isso acontece, não dá pra saber o fabricante real pelo MAC.
 */
function macAleatorizado(mac: string): boolean {
  const primeiroByte = mac.split(/[-:]/)[0];
  const valor = parseInt(primeiroByte, 16);
  if (Number.isNaN(valor)) return false;
  const multicast = (valor & 1) === 1;
  const localAdministrado = (valor & 2) === 2;
  return !multicast && localAdministrado;
}

/** Consulta o fabricante do adaptador de rede a partir do MAC (precisa de internet). */
function buscarFabricante(mac: string): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.get(`https://api.macvendors.com/${encodeURIComponent(mac)}`, (res) => {
      let dados = "";
      res.on("data", (c) => (dados += c));
      res.on("end", () => resolve(res.statusCode === 200 ? dados.trim() : null));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

/** Tenta descobrir o nome do dispositivo na rede (DNS/mDNS ou NetBIOS). */
async function resolverHostname(ip: string): Promise<string | null> {
  try {
    const saida = await executarComando(`ping -a -n 1 ${ip}`);
    const match = saida.match(/(?:Disparando contra|Pinging)\s+(\S+)\s*\[/i);
    if (match?.[1] && match[1] !== ip) return match[1];
  } catch {
    // segue tentando
  }

  try {
    const saida = await executarComando(`nbtstat -A ${ip}`);
    const linha = saida
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => /<00>\s+UNIQUE/i.test(l));
    if (linha) return linha.split(/\s+/)[0];
  } catch {
    // sem NetBIOS disponível (comum em celulares, Smart TVs, etc.)
  }

  return null;
}

export async function identificarDispositivos(): Promise<void> {
  if (!garantirWindows()) return;

  const rede = obterRedeLocal();
  if (!rede) {
    console.log(chalk.red("Não foi possível detectar a rede local."));
    return;
  }

  console.log(
    chalk.gray(
      `Escaneando ${rede.baseRede}.0/24 e identificando dispositivos (pode levar cerca de 1 minuto)...\n`
    )
  );

  const varreduras: Promise<unknown>[] = [];
  for (let i = 1; i <= 254; i++) {
    varreduras.push(execAsync(`ping -n 1 -w 150 ${rede.baseRede}.${i}`).catch(() => null));
  }
  await Promise.all(varreduras);

  const tabelaArp = await executarComando("arp -a");
  const dispositivos = tabelaArp
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^\d+\.\d+\.\d+\.\d+/.test(l))
    .map((l) => {
      const partes = l.split(/\s+/);
      return { ip: partes[0], mac: partes[1] };
    })
    .filter((d) => d.mac && d.mac.includes("-") && d.mac !== "ff-ff-ff-ff-ff-ff")
    .filter((d) => !ehMulticast(d.ip))
    .filter((d) => d.ip !== "255.255.255.255");

  if (dispositivos.length === 0) {
    console.log(chalk.yellow("Nenhum dispositivo encontrado."));
    return;
  }

  console.log(chalk.cyan(`Identificando ${dispositivos.length} dispositivo(s)...\n`));

  for (const dispositivo of dispositivos) {
    const ehRoteador = dispositivo.ip.endsWith(".1");
    const ehEsteComputador = dispositivo.ip === rede.meuIp;
    const ehAleatorizado = macAleatorizado(dispositivo.mac);

    const [fabricanteBruto, hostname] = await Promise.all([
      ehAleatorizado ? Promise.resolve(null) : buscarFabricante(dispositivo.mac),
      resolverHostname(dispositivo.ip),
    ]);

    console.log(chalk.green.bold(dispositivo.ip) + chalk.gray(`  (${dispositivo.mac})`));

    if (ehRoteador) {
      console.log(chalk.yellow("  → Provavelmente seu roteador/modem (IP terminado em .1)"));
    }
    if (ehEsteComputador) {
      console.log(chalk.gray("  → Este computador"));
    }

    if (ehAleatorizado) {
      console.log(
        `  Fabricante:   ${chalk.gray(
          "oculto (MAC aleatorizado — recurso de privacidade de celular)"
        )}`
      );
    } else {
      console.log(`  Fabricante:   ${fabricanteBruto ?? chalk.gray("desconhecido")}`);
    }

    console.log(`  Nome na rede: ${hostname ?? chalk.gray("não identificado")}`);
    console.log("");
  }

  console.log(chalk.gray("Como interpretar:"));
  console.log(
    chalk.gray('• "MAC aleatorizado" = celular/tablet com privacidade de rede ativada (iOS/Android recentes escondem o fabricante de propósito)')
  );
  console.log(chalk.gray("• Fabricante Apple/Samsung/Xiaomi/Huawei → geralmente celular ou tablet"));
  console.log(chalk.gray("• Fabricante Intel/Dell/Lenovo/ASUSTek/Realtek → geralmente computador"));
  console.log(chalk.gray("• Fabricante de modem/roteador (ex: MitraStar, TP-Link, Huawei) no IP .1 → seu roteador"));
  console.log(
    chalk.gray('• O nome na rede, quando aparece, costuma entregar o dono (ex: "Joao-iPhone", "DESKTOP-MARIA")')
  );
  console.log(
    chalk.gray("(Sem nome identificado é normal: muitos celulares e Smart TVs não respondem a NetBIOS/mDNS.)")
  );
}

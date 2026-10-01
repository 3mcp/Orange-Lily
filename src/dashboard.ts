import chalk from "chalk";
import os from "os";
import { Lily } from "./banner.js";
import { InfoEstatica, coletarInfoDinamica } from "./sistema/coletarInfoSistema.js";

function barra(percent: number, tamanho = 10): string {
  const p = Math.max(0, Math.min(100, percent));
  const preenchido = Math.round((p / 100) * tamanho);
  return "█".repeat(preenchido) + "░".repeat(tamanho - preenchido);
}

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function montarDashboard(estatica: InfoEstatica): string {
  const laranja = chalk.hex("#FFA500");
  const laranjaClaro = chalk.hex("#FFC870");
  const cinza = chalk.gray;
  const usuario = os.userInfo().username;

  const dinamica = coletarInfoDinamica();
  const ramPercent = (dinamica.ramUsadaGiB / dinamica.ramTotalGiB) * 100;

  const linhasPainel: string[] = [];
  linhasPainel.push(chalk.bold(laranja(`Hey, ${usuario}`)));
  linhasPainel.push("");
  linhasPainel.push(laranjaClaro("── Hardware ──"));
  linhasPainel.push(
    `${cinza("CPU")}      ${estatica.cpuNome} (${estatica.cpuNucleosFisicos}C/${estatica.cpuNucleosLogicos}T) @ ${estatica.cpuClockGHz.toFixed(
      2
    )} GHz`
  );
  if (estatica.gpuNome) {
    linhasPainel.push(
      `${cinza("GPU")}      ${estatica.gpuNome}${
        estatica.gpuRamGiB ? ` // ${estatica.gpuRamGiB.toFixed(1)} GiB` : ""
      }`
    );
  }
  linhasPainel.push(
    `${cinza("RAM")}      ${dinamica.ramUsadaGiB.toFixed(1)} GiB / ${dinamica.ramTotalGiB.toFixed(
      1
    )} GiB [${barra(ramPercent)}] ${ramPercent.toFixed(0)}%`
  );
  if (estatica.swapTotalGiB) {
    linhasPainel.push(`${cinza("SWAP")}     ${estatica.swapTotalGiB.toFixed(1)} GiB (arquivo de paginação)`);
  }
  for (const disco of estatica.discos) {
    const percent = (disco.usadoGiB / disco.totalGiB) * 100;
    linhasPainel.push(
      `${cinza("DRIVE")}    ${disco.letra} ${disco.usadoGiB.toFixed(1)} GiB / ${disco.totalGiB.toFixed(
        1
      )} GiB [${barra(percent)}] ${percent.toFixed(0)}%`
    );
  }
  linhasPainel.push("");
  linhasPainel.push(laranjaClaro("── Sessão ──"));
  linhasPainel.push(`${cinza("USUÁRIO")}  ${usuario}`);
  linhasPainel.push(`${cinza("UPTIME")}   ${dinamica.uptimeTexto}`);
  linhasPainel.push(`${cinza("DATA")}     ${dinamica.dataAtual}`);
  linhasPainel.push("");
  linhasPainel.push(laranja(`${saudacao()}, ${usuario}!`));

  const arteLinhas = Lily.split("\n");
  while (arteLinhas.length && arteLinhas[0].trim() === "") arteLinhas.shift();
  while (arteLinhas.length && arteLinhas[arteLinhas.length - 1].trim() === "") arteLinhas.pop();

  const larguraArte = Math.max(...arteLinhas.map((l) => l.length));
  const totalLinhas = Math.max(arteLinhas.length, linhasPainel.length);

  const linhasFinal: string[] = [];
  for (let i = 0; i < totalLinhas; i++) {
    const linhaArte = (arteLinhas[i] ?? "").padEnd(larguraArte);
    const linhaInfo = linhasPainel[i] ?? "";
    linhasFinal.push(`  ${laranja(linhaArte)}   ${linhaInfo}`);
  }

  return linhasFinal.join("\n");
}

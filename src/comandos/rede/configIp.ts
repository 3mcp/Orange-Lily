import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function configIp(): Promise<void> {
  if (!garantirWindows()) return;
  await rodarEMostrar("ipconfig /all", "Consultando configuração de rede...");
}

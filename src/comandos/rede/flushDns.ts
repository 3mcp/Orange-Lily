import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function flushDns(): Promise<void> {
  if (!garantirWindows()) return;
  await rodarEMostrar("ipconfig /flushdns", "Limpando cache DNS...");
}

import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function conexoesAtivas(): Promise<void> {
  if (!garantirWindows()) return;
  await rodarEMostrar("netstat -an", "Listando conexões ativas...");
}

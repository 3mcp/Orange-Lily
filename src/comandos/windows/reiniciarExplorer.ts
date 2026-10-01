import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function reiniciarExplorer(): Promise<void> {
  if (!garantirWindows()) return;
  await rodarEMostrar(
    "taskkill /f /im explorer.exe && start explorer.exe",
    "Reiniciando o Explorer..."
  );
}

import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function programasInicializacao(): Promise<void> {
  if (!garantirWindows()) return;
  await rodarEMostrar(
    'powershell -Command "Get-CimInstance Win32_StartupCommand | Select-Object Name,Command,Location | Format-Table -AutoSize"',
    "Consultando programas de inicialização..."
  );
}

import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function bateria(): Promise<void> {
  if (!garantirWindows()) return;

  await rodarEMostrar(
    'powershell -Command "Get-CimInstance Win32_Battery | Select-Object EstimatedChargeRemaining,BatteryStatus | Format-Table -AutoSize"',
    "Consultando bateria..."
  );
  console.log("(Se não aparecer nada, a máquina não tem bateria — é um desktop.)");
}

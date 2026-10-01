import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function statusDefender(): Promise<void> {
  if (!garantirWindows()) return;
  await rodarEMostrar(
    'powershell -Command "Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated | Format-List"',
    "Consultando status do Windows Defender..."
  );
}

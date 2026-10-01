import { rodarEMostrar, garantirWindows } from "../../utils/executarComando.js";

export async function espacoDisco(): Promise<void> {
  if (!garantirWindows()) return;

  await rodarEMostrar(
    `powershell -Command "Get-CimInstance Win32_LogicalDisk -Filter \\"DriveType=3\\" | Select-Object DeviceID,@{N='TotalGB';E={[math]::Round($_.Size/1GB,1)}},@{N='LivreGB';E={[math]::Round($_.FreeSpace/1GB,1)}} | Format-Table -AutoSize"`,
    "Consultando espaço em disco..."
  );
}

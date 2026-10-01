import type { Categoria } from "../types.js";

// Hardware
import { infoSistema } from "../comandos/hardware/infoSistema.js";
import { espacoDisco } from "../comandos/hardware/espacoDisco.js";
import { bateria } from "../comandos/hardware/bateria.js";
import { diagnosticoTemperatura } from "../comandos/hardware/diagnosticoTemperatura.js";

// Rede
import { configIp } from "../comandos/rede/configIp.js";
import { testarConectividade } from "../comandos/rede/testarConectividade.js";
import { flushDns } from "../comandos/rede/flushDns.js";
import { conexoesAtivas } from "../comandos/rede/conexoesAtivas.js";
import { scanRede } from "../comandos/rede/scanRede.js";
import { identificarDispositivos } from "../comandos/rede/identificarDispositivos.js";

// Windows
import { limparTemp } from "../comandos/windows/limparTemp.js";
import { verificarIntegridade } from "../comandos/windows/verificarIntegridade.js";
import { reiniciarExplorer } from "../comandos/windows/reiniciarExplorer.js";

// Segurança
import { usbStorage } from "../comandos/seguranca/usbStorage.js";
import { statusDefender } from "../comandos/seguranca/statusDefender.js";
import { programasInicializacao } from "../comandos/seguranca/programasInicializacao.js";

// Inventário
import { relatorioMaquina } from "../comandos/inventario/relatorioMaquina.js";
import { programasInstalados } from "../comandos/inventario/programasInstalados.js";

// Ferramentas
import { criarEmail } from "../comandos/ferramentas/criarEmail.js";
import { listarArquivos } from "../comandos/ferramentas/listarArquivos.js";
import { gerarSenha } from "../comandos/ferramentas/gerarSenha.js";
import { saudeDisco } from "../comandos/ferramentas/saudeDisco.js";

// Documentação
import { sobre } from "../comandos/documentacao/sobre.js";
import { changelog } from "../comandos/documentacao/changelog.js";

// Para adicionar uma categoria nova: crie uma pasta em src/comandos/,
// coloque os arquivos de comando lá dentro, importe aqui e adicione
// um novo objeto { nome, comandos } no array abaixo.
export function registrarCategorias(): Categoria[] {
  return [
    {
      nome: "Diagnóstico de Hardware",
      comandos: [
        { nome: "Informações do sistema (CPU/RAM/discos)", executar: infoSistema },
        { nome: "Espaço em disco por unidade", executar: espacoDisco },
        { nome: "Status da bateria", executar: bateria },
        { nome: "Diagnóstico de temperatura", executar: diagnosticoTemperatura },
      ],
    },
    {
      nome: "Diagnóstico de Rede",
      comandos: [
        { nome: "Ver configuração de IP (ipconfig /all)", executar: configIp },
        { nome: "Testar conectividade (ping)", executar: testarConectividade },
        { nome: "Limpar cache DNS", executar: flushDns },
        { nome: "Listar conexões ativas", executar: conexoesAtivas },
        { nome: "Dispositivos conectados na rede (scan)", executar: scanRede },
        { nome: "Identificar dispositivos (fabricante/nome)", executar: identificarDispositivos },
      ],
    },
    {
      nome: "Manutenção do Windows",
      comandos: [
        { nome: "Limpar arquivos temporários", executar: limparTemp },
        { nome: "Verificar integridade do sistema (sfc /scannow)", executar: verificarIntegridade },
        { nome: "Reiniciar o Explorer", executar: reiniciarExplorer },
      ],
    },
    {
      nome: "Segurança",
      comandos: [
        { nome: "Bloquear/Desbloquear USB", executar: usbStorage },
        { nome: "Status do Windows Defender", executar: statusDefender },
        { nome: "Programas de inicialização", executar: programasInicializacao },
      ],
    },
    {
      nome: "Inventário da Máquina",
      comandos: [
        { nome: "Gerar relatório da máquina (.txt)", executar: relatorioMaquina },
        { nome: "Listar programas instalados", executar: programasInstalados },
      ],
    },
    {
      nome: "Ferramentas",
      comandos: [
        { nome: "Criar e-mail POP", executar: criarEmail },
        { nome: "Listar arquivos da pasta atual", executar: listarArquivos },
        { nome: "Gerar senha aleatória", executar: gerarSenha },
        { nome: "Saúde do disco", executar: saudeDisco },
      ],
    },
    {
      nome: "Documentação",
      comandos: [
        { nome: "Sobre esta ferramenta", executar: sobre },
        { nome: "Changelog", executar: changelog },
      ],
    },
  ];
}

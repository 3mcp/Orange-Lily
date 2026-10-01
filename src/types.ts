export interface Comando {
  nome: string;
  executar: () => Promise<void>;
}

export interface Categoria {
  nome: string;
  comandos: Comando[];
}

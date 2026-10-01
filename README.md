# Orange Lily

Toolkit de suporte técnico em terminal, organizado por categorias.

## Rodar em modo desenvolvimento (precisa de Node instalado)

```bash
npm install
npm run dev
```

## Gerar um .exe standalone (não precisa de Node na máquina de destino)

```bash
npm install
npm run build:exe
```

Isso gera `release/orange-lily.exe` (~65MB, já com o Node embutido).
Copie esse único arquivo para qualquer Windows e rode — sem instalar nada.

## Estrutura

```
src/
├── index.ts                 # ponto de entrada
├── menu.ts                  # navegação (categorias → comandos)
├── banner.ts                 # arte ASCII/braille do topo
├── types.ts                  # tipos Comando e Categoria
├── utils/
│   └── executarComando.ts    # helper para rodar comandos do sistema
├── categorias/
│   └── index.ts               # registra TODAS as categorias e comandos
└── comandos/
    ├── hardware/              # Diagnóstico de Hardware
    ├── rede/                  # Diagnóstico de Rede
    ├── windows/                # Manutenção do Windows
    ├── seguranca/               # Segurança
    ├── inventario/               # Inventário da Máquina
    ├── ferramentas/               # Ferramentas
    └── documentacao/               # Documentação
```

## Adicionar uma funcionalidade nova

1. Crie um arquivo na pasta da categoria certa (ex: `src/comandos/rede/novoComando.ts`)
2. Exporte uma função `async`:
   ```ts
   export async function novoComando(): Promise<void> {
     console.log("faz alguma coisa aqui");
   }
   ```
3. Importe e registre em `src/categorias/index.ts`, dentro do array `comandos` da categoria certa.

## Adicionar uma categoria nova

1. Crie uma pasta em `src/comandos/`
2. Adicione um novo objeto `{ nome: "Nome da Categoria", comandos: [...] }` no array de `registrarCategorias()` em `src/categorias/index.ts`

## Publicar no GitHub

```bash
git init
git add .
git commit -m "primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/orange-lily.git
git push -u origin main
```

Em outra máquina, com internet:
```bash
git clone https://github.com/SEU-USUARIO/orange-lily.git
cd orange-lily
npm install
npm run dev
```

Ou, pra não depender de Node em outra máquina: gere o `.exe` (passo acima) e suba
como **Release** do GitHub (não no código-fonte, o arquivo é grande) — daí é só
baixar o `.exe` e rodar.

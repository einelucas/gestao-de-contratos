# Gestão de Contratos

Aplicação web corporativa para consulta, acompanhamento e gestão de contratos em um único ambiente. O sistema centraliza informações contratuais, indicadores, filtros, notificações e acompanhamento de vigência, com arquitetura preparada para integração futura com APIs e fontes de dados corporativas.

A aplicação foi desenvolvida em Next.js e TypeScript e publicada como Microsoft Power Apps Code App, mantendo o desenvolvimento tradicional no VS Code e a distribuição dentro do ecossistema Power Platform.

## Principais recursos

- dashboard executivo de contratos;
- indicadores de contratos totais, vigentes, vencidos e próximos do vencimento;
- identificação automática de contratos que exigem atenção;
- pesquisa por número, fornecedor e demais informações;
- filtros por fornecedor, unidade e situação;
- ordenação dos contratos;
- visualização em cards ou lista;
- paginação responsiva;
- painel lateral com detalhes do contrato;
- central de notificações;
- tema claro e escuro;
- layout responsivo para diferentes resoluções;
- importação de datasets por JSON;
- exportação dos dados atuais em JSON;
- persistência temporária de datasets no navegador;
- dados sintéticos para desenvolvimento e homologação;
- arquitetura preparada para APIs, SharePoint, Dataverse ou outras fontes corporativas.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Aplicação | Next.js, React e TypeScript |
| Interface | CSS nativo |
| Dados atuais | Mock / JSON / LocalStorage |
| Arquitetura de dados | Repository Pattern |
| Plataforma corporativa | Microsoft Power Apps Code Apps |
| Automações | Microsoft Power Automate |
| Identidade futura | Microsoft Entra ID |
| Desenvolvimento | VS Code |
| Versionamento | Git e GitHub |

## Arquitetura

A aplicação foi estruturada para que a interface não dependa diretamente da fonte de dados.

```text
Interface
    ↓
Regras de negócio
    ↓
ContractRepository
    ↓
┌──────────────┬───────────────┐
│ Atual        │ Futuro        │
│              │               │
│ Mock         │ REST API      │
│ JSON         │ SharePoint    │
│ LocalStorage │ Dataverse     │
│              │ Oracle        │
└──────────────┴───────────────┘
```

Isso permite desenvolver e homologar o sistema com dados sintéticos enquanto endpoints, APIs e permissões corporativas ainda não estão disponíveis.

Quando a fonte oficial for definida, apenas a implementação do repositório precisa ser substituída, preservando dashboard, componentes e regras de negócio.

## Estrutura do projeto

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── dashboard/
│   ├── data-management/
│   └── icons.tsx
│
├── data/
│   └── mock-contracts.ts
│
├── domain/
│   └── contract.ts
│
├── features/
│   └── contract-data/        importação, validação, exportação e geração de JSON
│
├── lib/
│   ├── contract-rules.ts
│   └── format.ts
│
└── repositories/
    ├── contract-repository.ts
    ├── contract-dataset-store.ts
    ├── mock-contract-repository.ts
    ├── local-dataset-contract-repository.ts
    ├── local-dataset-storage.ts
    └── index.ts

docs/
└── canvas-mapping.md         regras extraídas do Canvas App original
public/
AGENTS.md
README.md
next.config.ts
package.json
power.config.json
tsconfig.json
```

## Modelo de dados

Os componentes React não acessam diretamente mocks, arquivos JSON ou APIs.

Todas as operações relacionadas aos contratos passam pela camada de repositório:

```text
UI
 ↓
ContractRepository
 ↓
Fonte de dados
```

Atualmente, o sistema utiliza `LocalDatasetContractRepository`.

Quando existe um dataset importado pelo usuário, ele é utilizado como fonte principal.

Caso contrário, o sistema utiliza automaticamente os dados de demonstração disponíveis em `MockContractRepository`.

## Dados sintéticos

O projeto pode ser executado sem banco de dados ou acesso aos sistemas corporativos.

Os mocks permitem testar:

- contratos vigentes;
- contratos vencidos;
- contratos próximos do vencimento;
- contratos finalizados;
- diferentes unidades;
- diferentes fornecedores;
- paginação;
- filtros;
- pesquisa;
- indicadores;
- notificações.

Essa estratégia permite desenvolver e validar a aplicação antes da disponibilidade da integração definitiva.

Os mocks ficam em `src/data/mock-contracts.ts`. A origem dos dados é escolhida por `NEXT_PUBLIC_DATA_PROVIDER` (padrão: `mock`); para explicitar o provider, copie `.env.example` para `.env.local`.

## Importação de JSON

O aplicativo possui suporte para datasets locais em JSON.

O fluxo é:

```text
Arquivo JSON
     ↓
Leitura
     ↓
Validação
     ↓
Normalização
     ↓
Contract[]
     ↓
Repository
     ↓
Dashboard
```

Os dados importados são processados localmente pelo navegador e não exigem backend.

Quando um dataset é salvo localmente, ele passa a substituir os mocks de demonstração.

## Persistência local

Durante a fase de desenvolvimento, datasets importados são armazenados no `localStorage` do navegador.

```text
Aplicação inicia
       ↓
Existe dataset local?
       │
   ┌───┴────┐
   │        │
  Sim      Não
   │        │
   ▼        ▼
JSON      Mock
importado demonstração
```

Essa implementação é temporária e será substituída pela fonte corporativa quando os endpoints oficiais estiverem disponíveis.

## Regras de contratos

As situações utilizadas pela interface são derivadas pelas regras de negócio da aplicação.

Entre elas:

- vigente;
- vencido;
- sem data;
- finalizado;
- próximo do vencimento.

Contratos dentro da janela configurada de vencimento são destacados para acompanhamento.

As informações derivadas não precisam obrigatoriamente existir na fonte de dados, evitando duplicação de regras entre frontend e backend.

## Pré-requisitos

- Node.js 20.9+ (Node 22 LTS recomendado);
- npm;
- Git;
- VS Code;
- acesso ao ambiente Microsoft Power Platform para publicação do Code App.

## Configuração local

Clone o repositório:

```bash
git clone https://github.com/einelucas/gestao-de-contratos.git
cd gestao-de-contratos
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

## Build

Para gerar a versão de produção:

```bash
npm run build
```

O projeto utiliza exportação estática do Next.js para permitir publicação como Power Apps Code App.

O resultado do build é gerado em:

```text
out/
```

## Validação

Antes de publicar alterações:

```bash
npm run typecheck
npm run build
```

O projeto não deve ser publicado caso existam erros de TypeScript ou falhas no build.

## Power Apps Code Apps

A aplicação é desenvolvida normalmente no VS Code e publicada dentro do Microsoft Power Platform como um Code App.

Fluxo:

```text
VS Code
   ↓
Next.js
   ↓
npm run build
   ↓
Static Export
   ↓
pa app push
   ↓
Microsoft Power Apps
```

Para publicar:

```bash
npm run powerapps:push
```

ou:

```bash
pa app push
```

O ambiente Power Platform utilizado precisa ter **Power Apps Code Apps** habilitado.

### Primeira configuração

Instale a CLI oficial do Power Apps:

```powershell
npm install --global @microsoft/power-apps-cli
npm install --global @microsoft/power-apps
pa --version
```

Inicialize o Code App na raiz do projeto (a CLI solicita login e ambiente quando necessário e cria o `power.config.json`):

```powershell
npm run powerapps:init
```

O app é publicado como **Gestão de Contratos Web**, para não conflitar com o Canvas App existente chamado "Gestão de Contratos". Após a primeira publicação, o `appId` fica gravado em `power.config.json` e os próximos `push` atualizam o mesmo aplicativo.

### Testar no player do Power Apps (opcional)

Com `npm run dev` rodando em um terminal, execute em outro:

```powershell
npm run powerapps:run
```

Abra a URL `Local Play` usando o mesmo perfil do navegador conectado ao tenant Microsoft.

### Solução

O Code App pode ser incluído em uma solução pelo portal do Power Apps em **Soluções > Gestão de contratos V2 > Adicionar existente > App > Code app**, ou publicado diretamente nela:

```powershell
pa app push --solution-id <GUID-DA-SOLUCAO>
```

## Microsoft Power Automate

As automações corporativas permanecem separadas da interface.

O Power Automate poderá ser utilizado para:

- alertas de contratos próximos do vencimento;
- avisos de contratos vencidos;
- envio de e-mails aos responsáveis;
- resumos periódicos;
- processos de aprovação;
- notificações corporativas;
- integrações com outros serviços Microsoft.

Fluxo previsto:

```text
Gestão de Contratos
        ↓
Power Automate
        ↓
Outlook / Teams / Serviços corporativos
```

Automações agendadas podem funcionar independentemente do usuário abrir o aplicativo.

## Integração futura

A aplicação foi projetada para não depender de uma fonte específica.

Quando os endpoints corporativos estiverem disponíveis, poderão ser implementados novos adapters/repositories, por exemplo:

```text
ContractRepository
       │
       ├── LocalDatasetContractRepository
       ├── MockContractRepository
       ├── ApiContractRepository
       ├── SharePointContractRepository
       └── DataverseContractRepository
```

Para adicionar uma nova fonte:

1. crie uma classe que implemente `ContractRepository`;
2. mapeie os campos reais para o tipo `Contract`;
3. registre o novo provider em `src/repositories/index.ts`;
4. altere `NEXT_PUBLIC_DATA_PROVIDER`.

A fonte definitiva poderá ser definida de acordo com a infraestrutura disponibilizada pela organização.

## Segurança

A implementação atual com mocks e `localStorage` é destinada a desenvolvimento e homologação.

Em produção:

- autenticação deverá utilizar a identidade corporativa;
- permissões deverão ser validadas também na fonte de dados ou backend;
- esconder controles na interface não deve ser considerado mecanismo de segurança;
- dados sensíveis não devem permanecer armazenados no navegador;
- tokens, segredos e credenciais não devem ser versionados no Git.

## Versionamento

O projeto utiliza Git para rastrear alterações realizadas durante o desenvolvimento.

Antes de commits relevantes:

```bash
git status
git diff
npm run typecheck
npm run build
```

Claude Code e Codex podem trabalhar diretamente sobre o repositório, respeitando as diretrizes presentes em [`AGENTS.md`](AGENTS.md).

## Estado atual

Atualmente o projeto possui:

- interface principal funcional;
- dashboard;
- KPIs;
- cards e modo lista;
- filtros;
- pesquisa;
- ordenação;
- paginação;
- painel de detalhes;
- notificações;
- tema claro e escuro;
- layout responsivo;
- dados sintéticos;
- suporte a datasets JSON;
- publicação como Power Apps Code App.

A integração com a fonte corporativa definitiva ainda está pendente da disponibilização dos endpoints, APIs e permissões necessárias.

## Próximas etapas

- integrar a fonte oficial de contratos;
- integrar identidade e permissões corporativas;
- configurar perfis por setor;
- implementar automações definitivas no Power Automate;
- implementar notificações por e-mail;
- adicionar testes automatizados;
- ampliar auditoria e rastreabilidade das operações;
- substituir persistência local pela fonte corporativa;
- preparar fluxo de homologação e produção.

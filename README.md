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

## Arquitetura multissetorial

O setor é uma entidade de domínio (`Sector`), não apenas um filtro. Antes de acessar contratos, o usuário escolhe um setor, e esse setor define o contexto de todo o aplicativo.

```text
User               (CurrentUser: AppUser + SectorPermission[])
  ↓
Permissions        (src/auth/permissions.ts)
  ↓
Sector             (SectorProvider: setor selecionado + escopo liberado)
  ↓
Contracts          (ContractRepository.list({ sectorIds }))
  ↓
KPIs / filtros / pesquisa / paginação / notificações / detalhes
```

- `Sector` (`src/domain/sector.ts`): `id` estável (slug), `name`, `acronym` e `active`.
- `Contract.sectorId` referencia o setor dono do contrato.
- `SectorRepository` fornece os setores (hoje `MockSectorRepository`, com setores sintéticos de homologação).
- `SectorProvider` é o único lugar que guarda o setor selecionado e calcula o escopo de dados.
- O filtro por setor acontece no repositório: contratos de outros setores não chegam aos componentes.
- O último setor aberto fica salvo no navegador e é reaberto automaticamente se continuar ativo e liberado.
- O seletor no header troca de setor sem recarregar a página; filtros e paginação recomeçam.

### Rotas

| Rota | Tela |
| --- | --- |
| `#/setores` | Seleção de setor |
| `#/setor/manutencao` | Dashboard do setor |
| `#/todos-os-setores` | Visão consolidada (somente administrador) |

As rotas seguem o formato `/setor/[sectorId]`, mas ficam no hash da URL: o app é uma exportação estática servida pelo player do Power Apps a partir de um único `index.html`, onde caminhos reais quebrariam o carregamento e o recarregamento. Toda rota é montada por `src/navigation/routes.ts`, que já prevê `/setor/[sectorId]/contratos/[id]` para páginas futuras.

## Estrutura do projeto

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── auth/                     usuário atual, usuários/permissões mock e autorização central
│   ├── permissions.ts
│   ├── mock-users.ts
│   ├── access-directory.ts
│   ├── current-user-provider.ts
│   ├── mock-current-user-provider.ts
│   └── user-context.tsx
│
├── components/
│   ├── app/                  AppShell (usuário → setor → tela)
│   ├── auth/                 simulador de usuário (homologação)
│   ├── dashboard/
│   ├── data-management/
│   ├── sectors/              seleção e troca de setor
│   └── icons.tsx
│
├── config/
│   └── environment.ts
│
├── data/
│   ├── mock-contracts.ts
│   └── mock-sectors.ts
│
├── domain/
│   ├── contract.ts
│   ├── sector.ts
│   └── user.ts
│
├── features/
│   ├── contract-data/        importação, validação, exportação e geração de JSON
│   ├── sectors/              SectorProvider e leitura de contratos por escopo
│   └── theme/
│
├── lib/
│   ├── contract-rules.ts
│   ├── format.ts
│   └── sectors.ts
│
├── navigation/               rotas (hash) do app
│
└── repositories/
    ├── contract-repository.ts
    ├── contract-dataset-store.ts
    ├── mock-contract-repository.ts
    ├── local-dataset-contract-repository.ts
    ├── local-dataset-storage.ts
    ├── sector-repository.ts
    ├── mock-sector-repository.ts
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

Toda leitura informa um escopo de setores (`list({ sectorIds })`), e o repositório nunca devolve contratos fora dele.

Atualmente, o sistema utiliza `LocalDatasetContractRepository`.

Para cada setor, quando existe um dataset importado pelo usuário, ele é utilizado como fonte principal.

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

Cada contrato precisa de `sectorId`. Por compatibilidade com planilhas antigas, o importador também aceita um campo textual `sector` e nome ou sigla no lugar do id (`"Manutenção"` ou `"MAN"` → `"manutencao"`). Internamente, apenas `sectorId` é usado. Registros com setor desconhecido ou inativo são rejeitados.

Dentro de um setor, a importação afeta somente aquele setor e ignora o `sectorId` do arquivo (veja [Importação setorial](#importação-setorial)). "Restaurar dados do setor" volta apenas o setor atual para os dados de demonstração.

## Persistência local

Durante a fase de desenvolvimento, datasets importados são armazenados no `localStorage` do navegador, **separados por setor** (`gestao-contratos:dataset:v2`). Cada setor usa o próprio dataset importado ou, se não houver, os dados de demonstração. O usuário simulado fica em `gestao-contratos.current-user` e o último setor aberto em `gestao-contratos:last-sector:v1`.

```text
Aplicação inicia
       ↓
Existe dataset local do setor?
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

## Permissões de homologação

> **As permissões implementadas nesta fase são apenas de frontend e servem para desenvolvimento e homologação.**
> Quando a aplicação utilizar dados corporativos reais, a autorização deve ser aplicada também na API, backend, conector ou fonte de dados.
> Não é suficiente ocultar botões ou bloquear rotas no navegador para proteger dados corporativos.

### Modelo

```text
CurrentUserProvider (mock hoje, Entra ID no futuro)
        ↓
CurrentUser = AppUser + SectorPermission[]
        ↓
Autorização (src/auth/permissions.ts)
    ├─ setores permitidos → seleção de setor / rotas
    └─ ações permitidas   → menu Dados
        ↓
/setor/[sectorId] → validar acesso → ContractRepository (somente o setor)
```

- `AppUser` (`src/domain/user.ts`): `id`, `name`, `email`, `role`.
- `UserRole`: `viewer` (consulta), `sector-manager` (responsável do setor) e `admin`. O papel é um teto; o que o usuário pode fazer em cada setor vem das permissões.
- `SectorPermission`: associação explícita usuário ↔ setor com `canView` e `canImport` (e `canCreate`/`canEdit` reservados para o futuro). Um usuário pode ter permissões diferentes em cada setor.
- `admin` tem acesso global pela camada de autorização (não depende de `sectorIds: ["*"]`).
- **Responsável pela importação** = usuário `sector-manager` com `canImport` no setor. Um setor pode ter vários (titular e substituto). A tela de seleção mostra o responsável (ou "N responsáveis"), sempre derivado das permissões.

### Camada de autorização

Toda regra passa por funções puras em `src/auth/permissions.ts`: `canAccessSector`, `canImportContracts`, `canExportContracts`, `canRestoreDataset`, `canGenerateSyntheticData`, `getAccessibleSectors`, `getDataActions`, `authorizeContractImport`, `getImportResponsibles`, `isAdmin`. Componentes não testam `role` nem permissões diretamente.

| Perfil | Pode | Não pode |
| --- | --- | --- |
| `viewer` | consultar os setores com `canView`, pesquisar, filtrar, ver detalhes e KPIs, exportar os dados visíveis | importar, gerar ou restaurar dados |
| `sector-manager` | tudo do viewer; nos setores com `canImport`: importar JSON, baixar modelo, gerar dados sintéticos e restaurar a demonstração (estes dois somente em homologação) | ver setores sem permissão; alterar dados de outro setor |
| `admin` | todos os setores ativos, visão "Todos os setores" e todas as ações em qualquer setor | — |

### Usuários de teste

Definidos em `src/auth/mock-users.ts` (usuários + permissões):

| Usuário | Papel | Setores |
| --- | --- | --- |
| Consulta Manutenção | viewer | Manutenção (consulta) |
| Consulta Manutenção e Engenharia | viewer | Manutenção e Engenharia (consulta) |
| Responsável Manutenção | sector-manager | Manutenção (importa) |
| Substituto Manutenção | sector-manager | Manutenção (importa) |
| Responsável Suprimentos | sector-manager | Suprimentos (importa) |
| Responsável Engenharia | sector-manager | Engenharia (importa) |
| Responsável Administrativo e Financeiro | sector-manager | Administrativo e Financeiro (importa) |
| Responsável TI | sector-manager | TI (importa) |
| Administrador | admin | todos |

Todo setor ativo tem ao menos um responsável (`findSectorsWithoutImportResponsible` permite verificar a regra).

### Usuário simulado

- Em homologação (`NEXT_PUBLIC_APP_ENV=homologacao`), o header mostra o botão **Modo de teste • usuário** (borda tracejada) e o selo **Homologação**; a tela de seleção mostra "Ambiente de homologação • permissões simuladas".
- Somente o id do usuário escolhido é salvo em `localStorage` (`gestao-contratos.current-user`); ao recarregar, o mesmo usuário continua ativo. Sem valor salvo, o padrão é o Administrador.
- Ao trocar de usuário, os setores e as ações são recalculados; se o setor atual deixar de ser permitido, o app redireciona para a seleção de setor com o motivo.

### Proteção de rotas

`/setor/[sectorId]` só é aberto se `canAccessSector(currentUser, sectorId)`. Sem acesso, nenhum contrato é buscado: o escopo de dados fica vazio, o dashboard não é montado e o app redireciona para a seleção de setor exibindo o motivo.

### Importação setorial

- Dentro de `/setor/manutencao`, toda importação e geração de dados afeta **somente Manutenção**.
- O `sectorId` do arquivo é ignorado: o setor da rota é atribuído a todos os contratos (um aviso informa quantos registros declaravam outro setor). O arquivo não precisa ter `sectorId`.
- A troca acontece na camada de dados: `ContractDatasetStore.replaceSectorContracts(sectorId, contracts)` remove apenas o dataset daquele setor, grava o novo e salva o conjunto completo. Os demais setores são preservados.
- "Restaurar dados do setor" pede confirmação e volta somente aquele setor para os dados de demonstração.
- "Exportar dados atuais" exporta só o setor atual (`contratos-manutencao-AAAA-MM-DD.json`).
- Na visão "Todos os setores" (somente admin), o `sectorId` de cada registro decide o destino e cada setor é substituído isoladamente; arquivos com setores sem permissão são rejeitados por inteiro.

### Futuro: Microsoft Entra ID

A UI conhece apenas `CurrentUser`. Para integrar o Entra ID, implemente `EntraCurrentUserProvider` (interface `CurrentUserProvider` em `src/auth/current-user-provider.ts`) e uma `AccessDirectory` real (grupos do Entra, lista do SharePoint ou API), registrando-os em `src/auth/index.ts`. Dashboard, telas e regras de autorização não mudam. A mesma autorização precisa existir no backend/fonte de dados.

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
- seleção e troca de setor, com dados isolados por setor;
- permissões simuladas por usuário para homologação;
- publicação como Power Apps Code App.

A integração com a fonte corporativa definitiva ainda está pendente da disponibilização dos endpoints, APIs e permissões necessárias.

## Próximas etapas

- integrar a fonte oficial de contratos;
- integrar identidade e permissões corporativas (substituir `MockCurrentUserProvider` por `EntraCurrentUserProvider`);
- aplicar o escopo de setores também na API/backend;
- implementar automações definitivas no Power Automate;
- implementar notificações por e-mail;
- adicionar testes automatizados;
- ampliar auditoria e rastreabilidade das operações;
- substituir persistência local pela fonte corporativa;
- preparar fluxo de homologação e produção.

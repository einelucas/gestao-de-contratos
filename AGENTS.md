# Gestão de Contratos — regras para agentes

Este projeto é a reconstrução web do Canvas App de Gestão de Contratos, agora multissetorial.

## Stack
- Next.js 16 (App Router, exportação estática para Power Apps Code App)
- React 19
- TypeScript strict
- CSS nativo
- Providers atuais: dados sintéticos (`mock`) e usuário simulado (`mock`)

## Regras obrigatórias
1. Componentes React não acessam SharePoint/API diretamente.
2. Toda leitura de contratos passa por `ContractRepository` e recebe um `ContractScope` (`sectorIds`).
3. Nunca acessar contratos sem considerar o contexto do setor. O escopo vem de `SectorProvider` (`useSectorContext().scope`); não recrie a seleção de setor em outros componentes.
4. Nenhum componente deve implementar autorização diretamente (nada de `user.role === ...` ou leitura de `SectorPermission` na UI).
5. Toda autorização deve passar pela camada central de permissões em `src/auth/permissions.ts`.
6. Usuários nunca podem consultar contratos de setores não autorizados: valide `canAccessSector` antes de buscar e filtre no repositório (escopo), nunca esconda depois de renderizar.
7. Operações de dataset (importar, gerar, restaurar) devem ser sempre limitadas ao setor atual, via `ContractDatasetStore.replaceSectorContracts` / `resetSectorContracts`.
8. Não substituir o dataset global durante uma importação setorial. Dentro de um setor, o `sectorId` do arquivo é ignorado e o setor da rota é atribuído.
9. Importações só podem gravar setores autorizados (`authorizeContractImport`); arquivos com setores não autorizados são rejeitados por inteiro.
10. Permissões são associações explícitas usuário ↔ setor (`SectorPermission`). Responsáveis por setor são derivados delas (`getImportResponsibles`); não grave responsáveis no `Sector`.
11. `Sector.id` é a chave estável. Nunca use o nome do setor como identificador.
12. Preserve o domínio em `src/domain/` e as regras em `src/lib/contract-rules.ts`.
13. Não altere regras de negócio sem atualizar `docs/canvas-mapping.md`.
14. Tema claro e escuro devem continuar funcionais.
15. A grade precisa manter 1/2/3/4/5 colunas nos breakpoints equivalentes ao Canvas.
16. A paginação não pode criar rolagem horizontal.
17. Estado, unidade e prazo devem permanecer visíveis nos cards.
18. Detalhes são somente leitura nesta versão.
19. Rotas são montadas apenas por `src/navigation/routes.ts` (hash, por causa do player do Power Apps).
20. Antes de entregar uma mudança, rode `npm run typecheck`, `npm run lint` e `npm run build`.

## Permissões atuais
As permissões implementadas são apenas de frontend, para desenvolvimento e homologação. Com dados corporativos reais, a autorização precisa ser aplicada também na API/backend/conector/fonte de dados. Ocultar botões ou bloquear rotas no navegador não protege dados.

## Integração futura
- Contratos: `ApiContractRepository` ou `SharePointContractRepository` com a interface de `src/repositories/contract-repository.ts`, repassando o escopo de setores ao servidor.
- Setores: implementação de `SectorRepository` (`src/repositories/sector-repository.ts`).
- Usuário: `EntraCurrentUserProvider` com a interface `CurrentUserProvider` (`src/auth/current-user-provider.ts`) e uma `AccessDirectory` real, registrados em `src/auth/index.ts`.

A UI não deve ser reescrita para trocar a origem dos dados ou do usuário.

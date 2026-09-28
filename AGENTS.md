# Gestão de Contratos — regras para agentes

Este projeto é a reconstrução web do Canvas App de Gestão de Contratos.

## Stack
- Next.js 16 (App Router)
- React 19
- TypeScript strict
- CSS nativo
- Provider atual: dados sintéticos (`mock`)

## Regras obrigatórias
1. Componentes React não acessam SharePoint/API diretamente.
2. Toda leitura de contratos passa por `ContractRepository`.
3. Preserve o domínio em `src/domain/contract.ts` e as regras em `src/lib/contract-rules.ts`.
4. Não altere regras de negócio sem atualizar `docs/canvas-mapping.md`.
5. Tema claro e escuro devem continuar funcionais.
6. A grade precisa manter 1/2/3/4/5 colunas nos breakpoints equivalentes ao Canvas.
7. A paginação não pode criar rolagem horizontal.
8. Estado, unidade e prazo devem permanecer visíveis nos cards.
9. Detalhes são somente leitura nesta versão.
10. Antes de entregar uma mudança, rode `npm run typecheck` e `npm run build`.

## Integração futura
Implemente `ApiContractRepository` ou `SharePointContractRepository` usando a mesma interface de `src/repositories/contract-repository.ts`. A UI não deve ser reescrita para trocar a origem dos dados.

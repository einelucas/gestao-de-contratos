# Mapeamento do Canvas App para Next.js

Fonte analisada: `Gestao_de_Contratos_Homologacao_Correcao_Teams_Detalhes_20260928.zip` / `ScrHome.pa.yaml` e `Controls/4.json`.

## Fonte de dados do Canvas
Lista SharePoint `Relação Contratos` com os campos utilizados pelo app:
- Título (número do contrato)
- Fornecedor
- Prestação
- Valor Serviço
- Valor Material Proprio
- Valor Material Terceiros
- Valor Total
- Inicio Vigência
- Fim Vigência
- Unidade
- Situação

Na versão Next.js esses campos estão normalizados em `Contract` (`src/domain/contract.ts`).

## Regras preservadas

### Situação do contrato
Equivalente ao `App.OnStart` / `ScrHome.OnVisible`:
1. Se Situação contém `Finalizado` -> `Finalizado`.
2. Se Fim Vigência está vazio -> `Sem data`.
3. Se Fim Vigência é anterior a hoje -> `Vencido`.
4. Caso contrário -> `Vigente`.

Implementação: `deriveSituation` em `src/lib/contract-rules.ts`.

### Alerta de prazo
`varDiasAtencao` do Canvas = 20 dias.
- Finalizado -> `Finalizado`
- Sem data -> `SemData`
- Vencido -> `Vencido`
- Fim Vigência em até 20 dias -> `Atencao`
- demais -> `Regular`

Implementação: `deriveAlert`.

### KPIs
Preservados os cinco cards clicáveis:
- Total de contratos
- Vencidos
- Atenção
- Regulares
- Finalizados

O resumo respeita pesquisa, fornecedor, unidade e situação. O clique do KPI aplica um filtro adicional, como no Canvas.

### Pesquisa e filtros
Pesquisa por fornecedor (contém) ou número do contrato (prefixo). Filtros de fornecedor, unidade e situação foram mantidos.

### Ordenação
- Status e vencimento
- Nome do fornecedor
- Vencimento mais próximo

A prioridade padrão mantém: Vencido, Atenção, Sem data, Regular e demais/finalizados.

### Grade responsiva
Breakpoints do `galContratos.WrapCount` preservados:
- < 600px: 1 coluna
- < 870px: 2 colunas
- < 1160px: 3 colunas
- < 1500px: 4 colunas
- >= 1500px: 5 colunas

### Paginação
Mantido o conceito do Canvas de páginas agrupadas em blocos de 5. A quantidade de itens por página é calculada a partir da largura/altura útil do viewport de contratos.

### Notificações
Preservada a lógica geral:
- contratos finalizados não entram;
- vencidos entram;
- sem data entram;
- vigentes com vencimento entre hoje e 20 dias entram;
- prioridade: vence hoje, até 5 dias, vencidos, atenção e sem data.

### Detalhes
Painel somente leitura com fornecedor, contrato, unidade, situação, datas, valores e descrição da prestação.

## Setores (novo na versão web)
O Canvas atendia um único setor (o título exibia "Projetos e Arquitetura"). A versão web é multissetorial:
- `Contract.sectorId` referencia `Sector.id` (chave estável, slug). O nome do setor nunca é chave.
- Antes do dashboard, o usuário escolhe um setor; o filtro por setor é **estrutural** e acontece no repositório, antes de KPIs, filtros, pesquisa, paginação e notificações.
- Todas as regras acima (situação, alerta, KPIs, notificações, ordenação) passam a valer dentro do setor escolhido.
- A visão "Todos os setores" (somente administrador) aplica as mesmas regras sobre o conjunto consolidado dos setores liberados.
- Setores inativos não aparecem para seleção nem aceitam importação.

### Importação JSON
- **Dentro de um setor** (`/setor/[sectorId]`): o setor da rota é atribuído a todos os contratos e o `sectorId` do arquivo é ignorado (o arquivo não pode mudar o setor selecionado; o resumo avisa quantos registros declaravam outro setor). Somente o dataset desse setor é substituído.
- **Visão "Todos os setores"** (somente admin): `sectorId` é obrigatório em cada registro. Por compatibilidade com planilhas antigas, também são aceitos o campo textual `sector` e nome ou sigla no lugar do id (`"Manutenção"`, `"MAN"` → `"manutencao"`). Registros com setor desconhecido ou inativo são rejeitados individualmente, e cada setor presente no arquivo é substituído isoladamente.
- Em ambos os casos, os demais setores não mudam, e o usuário precisa de permissão de importação para todos os setores de destino.
- Datasets locais da versão anterior (sem setor) são descartados, pois não há como atribuí-los a um setor com segurança.

## Diferenças intencionais da versão inicial
- A origem real SharePoint está substituída por `MockContractRepository`.
- Dropdowns usam elementos HTML nativos em vez dos menus customizados do Canvas para reduzir complexidade inicial.
- Nenhuma escrita/edição foi habilitada, pois o Canvas analisado usa o formulário de detalhes em modo de visualização.

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

## Diferenças intencionais da versão inicial
- A origem real SharePoint está substituída por `MockContractRepository`.
- Dropdowns usam elementos HTML nativos em vez dos menus customizados do Canvas para reduzir complexidade inicial.
- Nenhuma escrita/edição foi habilitada, pois o Canvas analisado usa o formulário de detalhes em modo de visualização.

# Relatório de execução — SimplexLab MVP

## Etapa 1 — Backend, SQLite e arquitetura

Concluído:

- FastAPI configurado;
- SQLite em `backend/data/simplex.db`;
- arquitetura simples em `models`, `controllers`, `services` e `routes`;
- CORS configurado para o frontend local em `localhost:3000`.

## Etapa 2 — Motor matemático Simplex

Concluído:

- maximização;
- 2 variáveis principais;
- 2 ou 3 restrições `<=`;
- variáveis de folga;
- tabela inicial;
- escolha de coluna e linha pivô;
- teste da razão;
- normalização e operações de linha;
- iterações até otimalidade;
- solução final;
- `fractions.Fraction` para precisão exata.

## Etapa 3 — API REST

Concluído:

- `GET /health`;
- `GET /problems`;
- `GET /problems/{id}`;
- `GET /problems?difficulty=...`;
- `POST /simplex/solve`;
- `POST /simplex/validate-step`.

## Etapa 4 — Estrutura Next.js

Concluído:

- App Router;
- TypeScript;
- separação em `app`, `components`, `services` e `types`.

## Etapa 5 — Identidade visual

Concluído:

- preto `#000000` e ciano `#80FFF6` como cores principais;
- visual limpo e acadêmico;
- botões `rounded-lg`;
- layout em 100% da largura;
- foco visível e labels de formulário.

## Etapa 6 — Landing page e navegação

Concluído:

- hero;
- explicação do fluxo;
- recursos;
- CTA;
- header responsivo com indicação da página atual.

## Etapa 7 — Banca de problemas

Concluído:

- 18 problemas no SQLite;
- 6 fáceis;
- 6 intermediários;
- 6 difíceis;
- contextos variados;
- filtros por dificuldade.

## Etapa 8 — Formulário manual

Concluído:

- função objetivo pré-formatada;
- x1 e x2;
- duas restrições iniciais;
- terceira restrição opcional;
- validações em linguagem simples.

## Etapa 9 — Resolução guiada

Concluído:

- modelagem;
- forma padrão;
- tabela inicial;
- participação do aluno na coluna pivô;
- participação do aluno na linha pivô;
- feedback de acerto/erro;
- operações de pivoteamento;
- revisão de etapas;
- progresso visível.

## Etapa 10 — Gráfico Plotly

Concluído:

- gráfico 2D;
- restrições;
- região viável;
- vértices;
- labels;
- solução ótima destacada;
- escala calculada a partir do problema.

## Etapa 11 — Dicas

Concluído:

- dicas progressivas;
- dica para coluna pivô;
- dica para linha pivô;
- aviso discreto depois de 60 segundos reais sem interação.

## Etapa 12 — Responsividade, acessibilidade e validação

Concluído:

- menu mobile;
- tabelas com rolagem interna quando necessária;
- layout empilhado em telas menores;
- navegação por teclado em controles nativos;
- foco visível;
- mensagens que não dependem apenas de cor.

## Validações executadas

### Backend

- `python -m compileall`: aprovado;
- `pytest`: **8/8 testes aprovados**;
- API executada com Uvicorn e testada via HTTP: health, listagem e resolução retornaram HTTP 200.

### Banca

- **18/18 problemas** resolvidos sem falha;
- valor ótimo do motor Simplex comparado com o valor ótimo calculado pela geometria;
- **18/18 resultados coincidentes**.

### Frontend

- **15 arquivos TypeScript/TSX** processados pelo compilador TypeScript disponível no ambiente;
- **0 erros de sintaxe**.

### Limitação da validação neste ambiente

A instalação de dependências do frontend via `npm install` não concluiu porque o acesso ao registro npm ficou pendente até o limite da sessão. Por isso, o `next build` não pôde ser executado aqui. As versões estão fixadas no `package.json`; na máquina de desenvolvimento, execute `npm install` e depois `npm run build` ou `npm run dev`.

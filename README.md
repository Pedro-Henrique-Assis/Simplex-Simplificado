# SimplexLab — Sistema educacional do método Simplex

O **SimplexLab** é um sistema web educacional para alunos de graduação aprenderem o método Simplex de Pesquisa Operacional de forma guiada. O foco não é apenas obter a solução ótima: a aplicação explica a forma padrão, variáveis de folga, escolha de pivôs, teste da razão, operações de linha, otimalidade e interpretação gráfica.

## Tecnologias

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Plotly.js e KaTeX para renderização matemática.
- **Backend:** Python, FastAPI e Pydantic.
- **Banco:** SQLite local.
- **Comunicação:** API REST.

## Arquitetura

A estrutura é inspirada em MVC, deliberadamente simples:

```text
SimplexLab/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── seed.py
│   ├── requirements.txt
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   └── data/simplex.db
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── aprender/
│   │   ├── problemas/
│   │   ├── resolver/
│   │   └── sobre/
│   ├── components/
│   ├── services/
│   └── types/
└── README.md
```

O motor matemático fica isolado em `backend/services/simplex_service.py`. O cálculo geométrico fica em `graph_service.py`, e o frontend recebe os dados prontos para renderização, evitando duplicar regra matemática no navegador.

## Funcionalidades do MVP

- landing page e navegação responsiva;
- trilha “Aprender” com 16 tópicos progressivos, incluindo interpretação gráfica da região viável;
- biblioteca SQLite com 18 problemas: 6 fáceis, 6 intermediários e 6 difíceis;
- filtro por dificuldade;
- formulário manual pré-formatado para `x1` e `x2`;
- duas ou três restrições;
- validações com mensagens educativas;
- motor Simplex com `fractions.Fraction` para preservar resultados exatos;
- forma padrão e variáveis de folga;
- tabela inicial e tabelas de cada iteração;
- escolha interativa da coluna e da linha pivô;
- teste da razão explicado conta a conta;
- operações de pivoteamento exibidas;
- dicas progressivas e sugestão de dica após 60 segundos de inatividade;
- solução ótima com fração e aproximação decimal;
- gráfico Plotly 2D com restrições, região viável, vértices e ponto ótimo;
- layout responsivo para desktop, tablet e smartphone;
- tratamento de carregamento, erro, vazio, acerto, erro de resposta e solução concluída.

## Pré-requisitos

- Python 3.11 ou superior recomendado;
- Node.js moderno compatível com Next.js 16;
- npm.

## Executar o backend

No terminal, a partir da raiz do projeto:

```bash
cd backend
python -m venv venv
```

No Windows:

```bash
venv\Scripts\activate
```

No Linux/macOS:

```bash
source venv/bin/activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Crie/popule a banca inicial:

```bash
python seed.py
```

Execute a API:

```bash
uvicorn main:app --reload
```

A API ficará disponível em `http://localhost:8000`. A documentação interativa do FastAPI fica em `http://localhost:8000/docs`.

## Executar o frontend

Abra outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Se o backend estiver em outro endereço, copie `.env.example` para `.env.local` e ajuste:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testes

Os testes priorizam o motor matemático e a API:

```bash
cd backend
python -m pytest -q
```

Cobrem:

- problema conhecido com duas restrições;
- solução fracionária exata;
- três restrições;
- coerência entre ótimo do Simplex e ótimo geométrico;
- health check da API;
- seed com 18 problemas;
- filtro por dificuldade;
- endpoint de resolução.

## Endpoints principais

```text
GET  /health
GET  /problems
GET  /problems/{id}
GET  /problems?difficulty=easy
POST /simplex/solve
POST /simplex/validate-step
```

Exemplo de payload:

```json
{
  "objective": { "x1": 30, "x2": 40 },
  "constraints": [
    { "x1": 2, "x2": 1, "operator": "<=", "result": 8 },
    { "x1": 1, "x2": 2, "operator": "<=", "result": 10 }
  ]
}
```

## Limitações assumidas

Este MVP trabalha apenas com:

- maximização;
- duas variáveis principais (`x1` e `x2`);
- duas ou três restrições;
- restrições `<=`;
- `x1, x2 >= 0`;
- gráfico 2D;
- execução local;
- SQLite;
- sem autenticação.

Não estão implementados Big M, método das duas fases ou minimização.

## Critério pedagógico

Cada etapa procura responder cinco perguntas:

1. O que aconteceu?
2. Por que aconteceu?
3. Qual conta foi realizada?
4. Qual é o resultado?
5. Qual é o próximo passo?

O objetivo é transmitir a sensação de estar aprendendo Simplex com um tutor digital, e não apenas usando uma calculadora.

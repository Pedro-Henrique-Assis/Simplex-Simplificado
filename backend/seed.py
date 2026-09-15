from database import get_connection, init_db

PROBLEMS = [
    ("Produção de cadernos", "Uma gráfica decide quantos cadernos comuns (x1) e premium (x2) produzir com limites de impressão e acabamento.", "easy", 30, 40, 2, 1, 8, 1, 2, 10, None, None, None),
    ("Cardápio da confeitaria", "Uma confeitaria escolhe quantidades de bolos (x1) e tortas (x2) para maximizar a margem usando horas de cozinha e ovos.", "easy", 30, 40, 2, 1, 8, 3, 2, 12, None, None, None),
    ("Campanha local", "Uma equipe divide recursos entre anúncios digitais (x1) e ações presenciais (x2), respeitando orçamento e horas da equipe.", "easy", 50, 35, 1, 2, 10, 2, 1, 8, None, None, None),
    ("Plantio de duas culturas", "Uma fazenda distribui área entre cultura A (x1) e cultura B (x2) sob limites de terra e irrigação.", "easy", 45, 30, 1, 1, 8, 2, 1, 12, None, None, None),
    ("Montagem de kits", "Um centro de montagem combina kits básicos (x1) e completos (x2) com limites de componentes e tempo.", "easy", 25, 45, 1, 2, 12, 2, 1, 10, None, None, None),
    ("Entregas urbanas", "Uma operação logística distribui a frota entre rotas curtas (x1) e longas (x2), respeitando combustível e horas disponíveis.", "easy", 40, 55, 1, 1, 9, 1, 2, 14, None, None, None),

    ("Linha de embalagens", "Uma indústria programa dois tipos de embalagem em três recursos de produção para maximizar contribuição.", "intermediate", 55, 70, 2, 1, 18, 1, 3, 21, 1, 1, 10),
    ("Plano de mídia", "Uma empresa combina mídia de busca (x1) e vídeo (x2) com limites de orçamento, criação e alcance operacional.", "intermediate", 80, 65, 3, 2, 30, 1, 2, 16, 2, 1, 18),
    ("Mistura de rações", "Uma cooperativa planeja dois lotes de ração sob limites de processamento, armazenamento e insumo principal.", "intermediate", 42, 58, 2, 3, 24, 2, 1, 16, 1, 2, 14),
    ("Capacidade de oficinas", "Uma rede de oficinas distribui atendimentos preventivos (x1) e corretivos (x2) usando boxes, técnicos e equipamentos.", "intermediate", 90, 110, 2, 1, 20, 1, 2, 18, 3, 2, 30),
    ("Portfólio de relatórios", "Uma consultoria decide quantos relatórios detalhados (x1) e apresentações executivas (x2) produzir com horas de analista e designer.", "intermediate", 500, 400, 4, 2, 40, 2, 4, 32, 1, 1, 12),
    ("Programação de academia", "Uma academia escolhe aulas de musculação (x1) e natação (x2) respeitando limites de instrutores e ocupação.", "intermediate", 50, 70, 1, 2, 34, 2, 1, 26, 1, 1, 18),

    ("Usinagem de precisão", "Uma célula de usinagem define lotes de componentes x1 e x2 em três máquinas com tempos diferentes e solução potencialmente fracionária.", "hard", 83, 71, 5, 3, 31, 2, 7, 29, 4, 2, 24),
    ("Alocação de fertilizantes", "Uma fazenda combina dois planos de aplicação para maximizar retorno respeitando três recursos agrícolas.", "hard", 67, 59, 4, 5, 37, 7, 2, 32, 3, 4, 30),
    ("Janelas de transporte", "Uma transportadora distribui viagens de dois perfis sob limites de docas, motoristas e combustível.", "hard", 125, 108, 6, 5, 48, 3, 7, 42, 5, 2, 35),
    ("Produção metalúrgica", "Uma fábrica programa duas famílias de peças usando prensa, forno e acabamento, com coeficientes menos triviais.", "hard", 96, 121, 7, 4, 44, 3, 8, 46, 5, 5, 38),
    ("Orçamento de inovação", "Uma empresa distribui recursos entre protótipos x1 e testes x2 sob três tetos de orçamento e capacidade.", "hard", 77, 93, 8, 3, 39, 2, 9, 41, 5, 4, 32),
    ("Planejamento de laboratório", "Um laboratório combina ensaios de dois tipos com limites de equipamento, equipe e reagentes.", "hard", 113, 97, 9, 4, 52, 3, 8, 43, 5, 6, 45),
]


def seed() -> None:
    init_db()
    with get_connection() as conn:
        conn.execute("DELETE FROM attempts")
        conn.execute("DELETE FROM problems")
        conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('problems', 'attempts')")
        conn.executemany(
            """
            INSERT INTO problems (
                title, description, difficulty, objective_type,
                x1_coefficient, x2_coefficient,
                constraint_1_x1, constraint_1_x2, constraint_1_operator, constraint_1_result,
                constraint_2_x1, constraint_2_x2, constraint_2_operator, constraint_2_result,
                constraint_3_x1, constraint_3_x2, constraint_3_operator, constraint_3_result
            ) VALUES (?, ?, ?, 'maximize', ?, ?, ?, ?, '<=', ?, ?, ?, '<=', ?, ?, ?, ?, ?)
            """,
            [
                (
                    title, description, difficulty, x1c, x2c,
                    c1x1, c1x2, c1r,
                    c2x1, c2x2, c2r,
                    c3x1, c3x2, '<=' if c3x1 is not None else None, c3r,
                )
                for title, description, difficulty, x1c, x2c, c1x1, c1x2, c1r, c2x1, c2x2, c2r, c3x1, c3x2, c3r in PROBLEMS
            ],
        )
    print(f"Banco populado com {len(PROBLEMS)} problemas.")


if __name__ == "__main__":
    seed()

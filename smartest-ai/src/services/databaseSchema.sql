-- Core Tables
CREATE TABLE IF NOT EXISTS problem_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT
);

CREATE TABLE IF NOT EXISTS search_strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS instance_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_type_id INTEGER NOT NULL,
    min_size INTEGER,
    max_size INTEGER,
    size_param_name TEXT,
    additional_params TEXT,
    FOREIGN KEY (problem_type_id) REFERENCES problem_types(id)
);

CREATE TABLE IF NOT EXISTS strategy_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_type_id INTEGER NOT NULL,
    strategy_id INTEGER NOT NULL,
    min_size INTEGER,
    max_size INTEGER,
    condition_json TEXT,
    reason TEXT,
    priority INTEGER,
    FOREIGN KEY (problem_type_id) REFERENCES problem_types(id),
    FOREIGN KEY (strategy_id) REFERENCES search_strategies(id)
);

CREATE TABLE IF NOT EXISTS game_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    min_matrix_size INTEGER,
    max_matrix_size INTEGER,
    min_payoff INTEGER,
    max_payoff INTEGER
);

-- Template System Tables
CREATE TABLE IF NOT EXISTS question_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT UNIQUE NOT NULL, -- 'search', 'nash', 'csp', 'adversarial'
    name TEXT NOT NULL,
    text_template TEXT NOT NULL, -- Template with {{placeholders}}
    description TEXT,
    answer_format TEXT, -- Format expected (e.g., 'strategy_name', '(row,col)')
    evaluation_type TEXT -- 'strategy_match', 'nash_match', 'assignment_match', 'numeric_pair'
);

CREATE TABLE IF NOT EXISTS difficulty_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_type TEXT NOT NULL, -- 'search', 'nash', 'csp', 'adversarial'
    difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
    config_json TEXT NOT NULL, -- JSON with all generation parameters
    UNIQUE(question_type, difficulty),
    FOREIGN KEY (question_type) REFERENCES question_templates(type)
);

CREATE TABLE IF NOT EXISTS instance_generators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_type TEXT NOT NULL, -- 'search', 'nash', 'csp', 'adversarial'
    generator_name TEXT NOT NULL, -- Function name to call
    params_mapping TEXT NOT NULL, -- JSON mapping of template params to generator params
    UNIQUE(question_type),
    FOREIGN KEY (question_type) REFERENCES question_templates(type)
);

CREATE TABLE IF NOT EXISTS csp_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    csp_id INTEGER,
    min_variables INTEGER,
    max_variables INTEGER,
    param_name TEXT,
    additional_params TEXT
);

CREATE TABLE IF NOT EXISTS question_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_type_id INTEGER,
    instance_data TEXT,
    correct_answer TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_problem_type ON instance_configs(problem_type_id);
CREATE INDEX IF NOT EXISTS idx_strategy_problem ON strategy_rules(problem_type_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_type ON difficulty_configs(question_type);

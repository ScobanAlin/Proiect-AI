const PROBLEM_TYPES = [
    { name: 'N-Queens', description: 'Plasarea a N regine pe o tablă NxN', category: 'Search' },
    { name: 'Generalized Hanoi', description: 'Mutarea discurilor între tije', category: 'Search' },
    { name: 'Graph Coloring', description: 'Colorarea nodurilor unui graf', category: 'Search' },
    { name: 'Knight\'s Tour', description: 'Mutarea unui cal pe tabla de șah', category: 'Search' },
    { name: 'Nash Equilibrium', description: 'Găsirea Echilibrului Nash Pur într-un joc în formă normală', category: 'GameTheory' }
];

const SEARCH_STRATEGIES = [
    { name: 'Random', type: 'Uninformed', description: 'Alegere aleatorie a stărilor următoare' },
    { name: 'BFS', type: 'Uninformed', description: 'Breadth-First Search - explorare pe nivel' },
    { name: 'Uniform Cost', type: 'Uninformed', description: 'Expandare după cost minim cumulat' },
    { name: 'DFS', type: 'Uninformed', description: 'Depth-First Search - explorare în adâncime' },
    { name: 'Iterative Deepening', type: 'Uninformed', description: 'DFS iterativ cu limite crescânde' },
    { name: 'Backtracking', type: 'Uninformed', description: 'DFS cu pruning pentru CSP' },
    { name: 'Bidirectional', type: 'Uninformed', description: 'Căutare simultană din start și goal' },
    { name: 'Greedy Best-First', type: 'Informed', description: 'Expandare după h(n) minim' },
    { name: 'Hill Climbing', type: 'Informed', description: 'Local search, acceptă doar îmbunătățiri' },
    { name: 'Simulated Annealing', type: 'Informed', description: 'Local search cu acceptare probabilistică' },
    { name: 'Beam Search', type: 'Informed', description: 'BFS limitat la k candidați' },
    { name: 'A*', type: 'Informed', description: 'Expandare după f(n) = g(n) + h(n)' },
    { name: 'IDA*', type: 'Informed', description: 'A* iterativ cu memorie redusă' }
];

const INSTANCE_CONFIGS = [
    { problem_type_id: 1, min_size: 4, max_size: 11, size_param_name: 'n', additional_params: null },
    { problem_type_id: 2, min_size: 3, max_size: 7, size_param_name: 'discs', additional_params: '{"pegs_min": 3, "pegs_max": 4}' },
    { problem_type_id: 3, min_size: 5, max_size: 20, size_param_name: 'nodes', additional_params: '{"colors_min": 3, "colors_max": 5, "density_options": ["dens", "rar"]}' },
    { problem_type_id: 4, min_size: 5, max_size: 8, size_param_name: 'size', additional_params: null }
];

const STRATEGY_RULES = [
    { problem_type_id: 1, strategy_id: 6, min_size: 0, max_size: 6, condition_json: null, reason: 'Pentru N≤6 (dimensiune mică), Backtracking simplu este optim.', priority: 3 },
    { problem_type_id: 1, strategy_id: 5, min_size: 7, max_size: 10, condition_json: null, reason: 'Pentru N între 7-10 (dimensiune medie), Iterative Deepening combină avantajele DFS/BFS.', priority: 2 },
    { problem_type_id: 1, strategy_id: 9, min_size: 11, max_size: 999, condition_json: null, reason: 'Pentru N>10 (dimensiune mare), metodele uninformed sunt lente. Hill Climbing (local search) este rapid.', priority: 1 },
    { problem_type_id: 2, strategy_id: 4, min_size: 0, max_size: 10, condition_json: '{"pegs": 3}', reason: 'Pentru ≤10 discuri și 3 tije, DFS urmărește soluția recursivă optimă.', priority: 4 },
    { problem_type_id: 2, strategy_id: 13, min_size: 11, max_size: 999, condition_json: '{"pegs": 3}', reason: 'Pentru >10 discuri și 3 tije, IDA* reduce memoria față de A* clasic, menținând optimalitatea.', priority: 3 },
    { problem_type_id: 2, strategy_id: 2, min_size: 0, max_size: 8, condition_json: '{"pegs": [4]}', reason: 'Pentru ≤8 discuri și 4 tije, BFS garantează soluția optimă, spațiul fiind controlabil.', priority: 2 },
    { problem_type_id: 2, strategy_id: 12, min_size: 9, max_size: 999, condition_json: '{"pegs": [4]}', reason: 'Pentru >8 discuri și 4 tije (dimensiune mare), A* cu euristică Frame-Stewart oferă cel mai bun compromis.', priority: 1 },
    { problem_type_id: 3, strategy_id: 6, min_size: 0, max_size: 10, condition_json: null, reason: 'Graf mic, Backtracking explorează sistematic, pruning rapid.', priority: 3 },
    { problem_type_id: 3, strategy_id: 10, min_size: 16, max_size: 999, condition_json: '{"density": "dens"}', reason: 'Graf mare și dens. Simulated Annealing scapă de minimele locale și explorează spațiul vast eficient.', priority: 2 },
    { problem_type_id: 3, strategy_id: 8, min_size: 11, max_size: 999, condition_json: null, reason: 'Graf mediu. Greedy cu euristica "cel mai constrâns nod primul" găsește rapid soluții.', priority: 1 },
    { problem_type_id: 4, strategy_id: 6, min_size: 0, max_size: 6, condition_json: null, reason: 'Tablă mică. Backtracking cu pruning geometric găsește soluții rapid.', priority: 2 },
    { problem_type_id: 4, strategy_id: 8, min_size: 7, max_size: 999, condition_json: null, reason: 'Tablă medie/mare. Greedy cu euristica Warnsdorff rezolvă în timp aproape liniar.', priority: 1 }
];

const GAME_CONFIGS = [
    { name: 'Standard Nash Game', description: 'Joc în formă normală 2x2 sau 3x3', min_matrix_size: 2, max_matrix_size: 3, min_payoff: 0, max_payoff: 5 }
];

const buildInsert = (table, columns, data) => {
    const values = data.map(row => {
        const vals = columns.map(col => {
            const value = row[col];
            if (value === null || value === undefined) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
            return `${value}`;
        });
        return `(${vals.join(', ')})`;
    }).join(',\n      ');

    return `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES\n      ${values};`;
};

export const seedDatabase = () => {
    return `
    ${buildInsert('problem_types', ['name', 'description', 'category'], PROBLEM_TYPES)}

    ${buildInsert('search_strategies', ['name', 'type', 'description'], SEARCH_STRATEGIES)}

    ${buildInsert('instance_configs', ['problem_type_id', 'min_size', 'max_size', 'size_param_name', 'additional_params'], INSTANCE_CONFIGS)}

    ${buildInsert('strategy_rules', ['problem_type_id', 'strategy_id', 'min_size', 'max_size', 'condition_json', 'reason', 'priority'], STRATEGY_RULES)}

    ${buildInsert('game_configs', ['name', 'description', 'min_matrix_size', 'max_matrix_size', 'min_payoff', 'max_payoff'], GAME_CONFIGS)}
  `;
};

import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, CheckCircle, AlertCircle, Send, Sparkles, FileText, RotateCcw, Box, Database, Zap } from 'lucide-react';
import { runAlgorithmComparison, selectBestStrategy } from '../utils/algorithmSolvers';

// ============================================================================
// DATABASE INITIALIZATION AND SCHEMA
// ============================================================================

const initDatabase = () => {
    const SQL = `
    -- Problem Types Table
    CREATE TABLE IF NOT EXISTS problem_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Search', 'GameTheory'))
    );

    -- Search Strategies Table
    CREATE TABLE IF NOT EXISTS search_strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('Uninformed', 'Informed')),
      description TEXT NOT NULL
    );

    -- Problem Instances Configuration
    CREATE TABLE IF NOT EXISTS instance_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_type_id INTEGER NOT NULL,
      min_size INTEGER NOT NULL,
      max_size INTEGER NOT NULL,
      size_param_name TEXT NOT NULL,
      additional_params TEXT, -- JSON string for extra parameters
      FOREIGN KEY (problem_type_id) REFERENCES problem_types(id)
    );

    -- Strategy Mapping Rules
    CREATE TABLE IF NOT EXISTS strategy_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_type_id INTEGER NOT NULL,
      strategy_id INTEGER,
      min_size INTEGER,
      max_size INTEGER,
      condition_json TEXT, -- JSON for complex conditions (density, pegs, etc)
      reason TEXT NOT NULL,
      priority INTEGER DEFAULT 0, -- Higher priority rules checked first
      FOREIGN KEY (problem_type_id) REFERENCES problem_types(id),
      FOREIGN KEY (strategy_id) REFERENCES search_strategies(id)
    );

    -- Game Theory Configurations
    CREATE TABLE IF NOT EXISTS game_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      min_matrix_size INTEGER DEFAULT 2,
      max_matrix_size INTEGER DEFAULT 3,
      min_payoff INTEGER DEFAULT 0,
      max_payoff INTEGER DEFAULT 5
    );

    -- Generated Questions Log (optional, for tracking)
    CREATE TABLE IF NOT EXISTS question_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_type_id INTEGER,
      instance_data TEXT, -- JSON
      correct_answer TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (problem_type_id) REFERENCES problem_types(id)
    );
  `;

    return SQL;
};

const seedDatabase = () => {
    return `
    -- Insert Problem Types
    INSERT OR IGNORE INTO problem_types (name, description, category) VALUES
      ('N-Queens', 'Plasarea a N regine pe o tablă NxN', 'Search'),
      ('Generalized Hanoi', 'Mutarea discurilor între tije', 'Search'),
      ('Graph Coloring', 'Colorarea nodurilor unui graf', 'Search'),
      ('Knight''s Tour', 'Mutarea unui cal pe tabla de șah', 'Search'),
      ('Nash Equilibrium', 'Găsirea Echilibrului Nash Pur într-un joc în formă normală', 'GameTheory');

    -- Insert Search Strategies
    INSERT OR IGNORE INTO search_strategies (name, type, description) VALUES
      ('Random', 'Uninformed', 'Alegere aleatorie a stărilor următoare'),
      ('BFS', 'Uninformed', 'Breadth-First Search - explorare pe nivel'),
      ('Uniform Cost', 'Uninformed', 'Expandare după cost minim cumulat'),
      ('DFS', 'Uninformed', 'Depth-First Search - explorare în adâncime'),
      ('Iterative Deepening', 'Uninformed', 'DFS iterativ cu limite crescânde'),
      ('Backtracking', 'Uninformed', 'DFS cu pruning pentru CSP'),
      ('Bidirectional', 'Uninformed', 'Căutare simultană din start și goal'),
      ('Greedy Best-First', 'Informed', 'Expandare după h(n) minim'),
      ('Hill Climbing', 'Informed', 'Local search, acceptă doar îmbunătățiri'),
      ('Simulated Annealing', 'Informed', 'Local search cu acceptare probabilistică'),
      ('Beam Search', 'Informed', 'BFS limitat la k candidați'),
      ('A*', 'Informed', 'Expandare după f(n) = g(n) + h(n)'),
      ('IDA*', 'Informed', 'A* iterativ cu memorie redusă');

    -- Insert Instance Configs
    INSERT OR IGNORE INTO instance_configs (problem_type_id, min_size, max_size, size_param_name, additional_params) VALUES
      (1, 4, 11, 'n', NULL), -- N-Queens
      (2, 3, 7, 'discs', '{"pegs_min": 3, "pegs_max": 4}'), -- Hanoi
      (3, 5, 20, 'nodes', '{"colors_min": 3, "colors_max": 5, "density_options": ["dens", "rar"]}'), -- Graph Coloring
      (4, 5, 8, 'size', NULL); -- Knight's Tour

    -- Insert Strategy Rules for N-Queens
    INSERT OR IGNORE INTO strategy_rules (problem_type_id, strategy_id, min_size, max_size, condition_json, reason, priority) VALUES
      (1, 6, 0, 6, NULL, 'Pentru N≤6 (dimensiune mică), Backtracking simplu este optim.', 3),
      (1, 5, 7, 10, NULL, 'Pentru N între 7-10 (dimensiune medie), Iterative Deepening combină avantajele DFS/BFS.', 2),
      (1, 9, 11, 999, NULL, 'Pentru N>10 (dimensiune mare), metodele uninformed sunt lente. Hill Climbing (local search) este rapid.', 1);

    -- Insert Strategy Rules for Generalized Hanoi
    INSERT OR IGNORE INTO strategy_rules (problem_type_id, strategy_id, min_size, max_size, condition_json, reason, priority) VALUES
      (2, 4, 0, 10, '{"pegs": 3}', 'Pentru ≤10 discuri și 3 tije, DFS urmărește soluția recursivă optimă.', 4),
      (2, 13, 11, 999, '{"pegs": 3}', 'Pentru >10 discuri și 3 tije, IDA* reduce memoria față de A* clasic, menținând optimalitatea.', 3),
      (2, 2, 0, 8, '{"pegs": [4]}', 'Pentru ≤8 discuri și 4 tije, BFS garantează soluția optimă, spațiul fiind controlabil.', 2),
      (2, 12, 9, 999, '{"pegs": [4]}', 'Pentru >8 discuri și 4 tije (dimensiune mare), A* cu euristică Frame-Stewart oferă cel mai bun compromis.', 1);

    -- Insert Strategy Rules for Graph Coloring
    INSERT OR IGNORE INTO strategy_rules (problem_type_id, strategy_id, min_size, max_size, condition_json, reason, priority) VALUES
      (3, 6, 0, 10, NULL, 'Graf mic, Backtracking explorează sistematic, pruning rapid.', 3),
      (3, 10, 16, 999, '{"density": "dens"}', 'Graf mare și dens. Simulated Annealing scapă de minimele locale și explorează spațiul vast eficient.', 2),
      (3, 8, 11, 999, NULL, 'Graf mediu. Greedy cu euristica "cel mai constrâns nod primul" găsește rapid soluții.', 1);

    -- Insert Strategy Rules for Knight's Tour
    INSERT OR IGNORE INTO strategy_rules (problem_type_id, strategy_id, min_size, max_size, condition_json, reason, priority) VALUES
      (4, 6, 0, 6, NULL, 'Tablă mică. Backtracking cu pruning geometric găsește soluții rapid.', 2),
      (4, 8, 7, 999, NULL, 'Tablă medie/mare. Greedy cu euristica Warnsdorff rezolvă în timp aproape liniar.', 1);

    -- Insert Game Theory Config
    INSERT OR IGNORE INTO game_configs (name, description, min_matrix_size, max_matrix_size, min_payoff, max_payoff) VALUES
      ('Standard Nash Game', 'Joc în formă normală 2x2 sau 3x3', 2, 3, 0, 5);
  `;
};

// ============================================================================
// IN-MEMORY DATABASE SERVICE
// ============================================================================

class DatabaseService {
    constructor() {
        this.db = {
            problemTypes: [],
            searchStrategies: [],
            instanceConfigs: [],
            strategyRules: [],
            gameConfigs: [],
            questionLog: []
        };
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Parse and execute seed data
        const seedSQL = seedDatabase();
        const statements = seedSQL.split(';').filter(s => s.trim());

        statements.forEach(stmt => {
            if (stmt.includes('INSERT') && stmt.includes('problem_types')) {
                // Găsește TOATE grupurile de tip ('name','desc','category')
                const matches = [...stmt.matchAll(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g)];
                matches.forEach((m) => {
                    const [, name, description, category] = m;
                    this.db.problemTypes.push({
                        id: this.db.problemTypes.length + 1,
                        name,
                        description,
                        category,
                    });
                });
            }

            if (stmt.includes('INSERT') && stmt.includes('search_strategies')) {
                const matches = stmt.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g);

                matches?.forEach(match => {
                    const [, name, type, description] =
                        match.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);

                    this.db.searchStrategies.push({
                        id: this.db.searchStrategies.length + 1,
                        name,
                        type,
                        description
                    });
                });
            }

            if (stmt.includes('INSERT') && stmt.includes('instance_configs')) {
                const matches = stmt.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*')\)/g);
                matches?.forEach(match => {
                    const [, problemTypeId, minSize, maxSize, sizeParamName, additionalParams] =
                        match.match(/\((\d+),\s*(\d+),\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*')\)/);

                    this.db.instanceConfigs.push({
                        id: this.db.instanceConfigs.length + 1,
                        problem_type_id: parseInt(problemTypeId),
                        min_size: parseInt(minSize),
                        max_size: parseInt(maxSize),
                        size_param_name: sizeParamName,
                        additional_params: additionalParams === 'NULL' ? null : JSON.parse(additionalParams.replace(/^'|'$/g, ''))
                    });
                });
            }

            if (stmt.includes('INSERT') && stmt.includes('strategy_rules')) {
                const matches = stmt.match(/\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(\d+)\)/g);
                matches?.forEach(match => {
                    const [, problemTypeId, strategyId, minSize, maxSize, conditionJson, reason, priority] =
                        match.match(/\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(NULL|'[^']*'),\s*'([^']+)',\s*(\d+)\)/);

                    this.db.strategyRules.push({
                        id: this.db.strategyRules.length + 1,
                        problem_type_id: parseInt(problemTypeId),
                        strategy_id: parseInt(strategyId),
                        min_size: parseInt(minSize),
                        max_size: parseInt(maxSize),
                        condition_json: conditionJson === 'NULL' ? null : JSON.parse(conditionJson.replace(/^'|'$/g, '')),
                        reason: reason,
                        priority: parseInt(priority)
                    });
                });
            }

            if (stmt.includes('INSERT') && stmt.includes('game_configs')) {
                const match = stmt.match(/VALUES\s*\('([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
                if (match) {
                    const [, name, description, minMatrix, maxMatrix, minPayoff, maxPayoff] = match;
                    this.db.gameConfigs.push({
                        id: 1,
                        name,
                        description,
                        min_matrix_size: parseInt(minMatrix),
                        max_matrix_size: parseInt(maxMatrix),
                        min_payoff: parseInt(minPayoff),
                        max_payoff: parseInt(maxPayoff)
                    });
                }
            }
        });

        this.initialized = true;
    }

    // Query methods
    getProblemTypeByName(name) {
        return this.db.problemTypes.find(pt => pt.name === name);
    }

    getProblemTypeById(id) {
        return this.db.problemTypes.find(pt => pt.id === id);
    }

    getAllProblemTypes(category = null) {
        if (category) {
            return this.db.problemTypes.filter(pt => pt.category === category);
        }
        return this.db.problemTypes;
    }

    getStrategyById(id) {
        return this.db.searchStrategies.find(s => s.id === id);
    }

    getInstanceConfig(problemTypeId) {
        return this.db.instanceConfigs.find(ic => ic.problem_type_id === problemTypeId);
    }

    getStrategyRules(problemTypeId, size, additionalConditions = {}) {
        let rules = this.db.strategyRules
            .filter(r => r.problem_type_id === problemTypeId)
            .filter(r => size >= r.min_size && size <= r.max_size);

        // Filter by additional conditions
        if (Object.keys(additionalConditions).length > 0) {
            rules = rules.filter(r => {
                if (!r.condition_json) return true;

                for (const [key, value] of Object.entries(additionalConditions)) {
                    if (r.condition_json[key] !== undefined) {
                        if (Array.isArray(r.condition_json[key])) {
                            if (!r.condition_json[key].includes(value)) return false;
                        } else {
                            if (r.condition_json[key] !== value) return false;
                        }
                    }
                }
                return true;
            });
        }

        // Sort by priority (highest first)
        rules.sort((a, b) => b.priority - a.priority);
        return rules;
    }

    getGameConfig() {
        return this.db.gameConfigs[0];
    }

    logQuestion(problemTypeId, instanceData, correctAnswer) {
        this.db.questionLog.push({
            id: this.db.questionLog.length + 1,
            problem_type_id: problemTypeId,
            instance_data: JSON.stringify(instanceData),
            correct_answer: JSON.stringify(correctAnswer),
            generated_at: new Date().toISOString()
        });
    }
}

// Initialize database
const db = new DatabaseService();
db.init();

// ============================================================================
// CHAT AGENT - PARSER LOGIC
// ============================================================================

const parseSearchProblems = (text) => {
    const problems = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        // 1. N-Queens
        if (line.toLowerCase().includes('queens') || line.toLowerCase().includes('regine')) {
            const nMatch = line.match(/n\s*=\s*(\d+)/i) || line.match(/(\d+)\s*regine/i) || line.match(/tablă\s*(\d+)x\s*\d+/i);
            if (nMatch) {
                const n = parseInt(nMatch[1]);
                problems.push({
                    name: 'N-Queens',
                    instance: { text: `N=${n} (tablă ${n}x${n})`, n: n, size: n }
                });
            }
        }

        // 2. Generalized Hanoi
        if (line.toLowerCase().includes('hanoi') || line.toLowerCase().includes('discuri')) {
            const discMatch = line.match(/(\d+)\s*discuri/i);
            const pegMatch = line.match(/(\d+)\s*tije/i);
            if (discMatch) {
                const discs = parseInt(discMatch[1]);
                const pegs = pegMatch ? parseInt(pegMatch[1]) : 3;
                problems.push({
                    name: 'Generalized Hanoi',
                    instance: { text: `${discs} discuri, ${pegs} tije`, discs, pegs, size: discs }
                });
            }
        }

        // 3. Graph Coloring
        if (line.toLowerCase().includes('graph') || line.toLowerCase().includes('graf') || line.toLowerCase().includes('colorare')) {
            const nodeMatch = line.match(/(\d+)\s*noduri/i);
            const edgeMatch = line.match(/(\d+)\s*muchii/i);
            const colorMatch = line.match(/(\d+)\s*culori/i);
            const isDenseUser = line.toLowerCase().includes('dens');

            if (nodeMatch) {
                const nodes = parseInt(nodeMatch[1]);
                const maxEdges = nodes * (nodes - 1) / 2;
                let edges = edgeMatch ? parseInt(edgeMatch[1]) : null;
                const colors = colorMatch ? parseInt(colorMatch[1]) : 3;

                if (edges === null || edges < nodes - 1 || edges > maxEdges) {
                    const generatedInstance = generateSearchInstance('Graph Coloring');
                    edges = generatedInstance.edges;
                }

                const densityRatio = edges / maxEdges;
                let finalDensity;
                if (densityRatio >= 0.6) {
                    finalDensity = 'dens';
                } else if (densityRatio <= 0.3) {
                    finalDensity = 'rar';
                } else {
                    finalDensity = 'mediu';
                }

                problems.push({
                    name: 'Graph Coloring',
                    instance: {
                        text: `Graf ${finalDensity} cu ${nodes} noduri, ${edges} muchii, ${colors} culori`,
                        nodes: nodes,
                        edges: edges,
                        colors: colors,
                        density: finalDensity,
                        size: nodes
                    }
                });
            }
        }

        // 4. Knight's Tour
        if (line.toLowerCase().includes('knight') || line.toLowerCase().includes('cal')) {
            const sizeMatch = line.match(/(\d+)\s*x\s*(\d+)/i) || line.match(/tablă\s*(\d+)/i);
            if (sizeMatch) {
                const size = parseInt(sizeMatch[1]);
                problems.push({
                    name: "Knight's Tour",
                    instance: { text: `Tablă ${size}x${size}`, size }
                });
            }
        }
    }

    // Generate random instance if generic question
    if (problems.length === 0 && (text.toLowerCase().includes('strategie') || text.toLowerCase().includes('backtracking') || text.toLowerCase().includes('a*'))) {
        const searchProblems = db.getAllProblemTypes('Search');
        const randomProblem = searchProblems[Math.floor(Math.random() * searchProblems.length)];
        const instance = generateSearchInstance(randomProblem.name);
        problems.push({
            name: randomProblem.name,
            instance: instance
        });
    }

    return problems;
};

const extractMatrixFromText = (text) => {
    const payoffRegex = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;

    // 1️⃣ Split în rânduri prin ;
    let rowsRaw = text.split(";");

    // 2️⃣ Dacă nu există ;, split prin newline
    if (rowsRaw.length === 1) {
        rowsRaw = text.split("\n");
    }

    // 3️⃣ Curățare
    rowsRaw = rowsRaw
        .map(r => r.trim())
        .filter(r => r.length > 0);

    const matrix = [];

    for (const row of rowsRaw) {
        const matches = [...row.matchAll(payoffRegex)];
        if (matches.length === 0) continue;

        const parsedRow = matches.map(m => [
            parseInt(m[1], 10),
            parseInt(m[2], 10)
        ]);

        matrix.push(parsedRow);
    }

    if (matrix.length === 0) return null;

    // 4️⃣ Verificăm consistența rândurilor
    const colCount = matrix[0].length;
    if (!matrix.every(r => r.length === colCount)) {
        console.warn("Matrice inconsistentă — diferite număr de coloane pe rând.");
        return null;
    }

    return matrix;
};



const parseQuestionFromText = (text) => {
    const problems = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('nash') || lowerText.includes('echilibru') || lowerText.includes('matrice')) {

        const parsedMatrix = extractMatrixFromText(text);

        if (parsedMatrix) {
            const rows = parsedMatrix.length;
            const cols = parsedMatrix[0].length;

            problems.push({
                name: 'Nash Equilibrium',
                instance: {
                    matrix: parsedMatrix,
                    rows,
                    cols,
                    text: `Joc parsat ${rows}x${cols}`,
                    visual: parsedMatrix
                        .map(r => r.map(c => `(${c[0]}, ${c[1]})`).join(" | "))
                        .join(" ;\n")
                }
            });

            return problems;
        }

        // Fall back to random example
        const exampleInstance = generateNashInstance();
        problems.push({
            name: 'Nash Equilibrium',
            instance: exampleInstance
        });

        return problems;
    }

    // search problems as before
    const searchProblems = parseSearchProblems(text);
    problems.push(...searchProblems);
    return problems;
};


const generateChatResponse = (question) => {
    const parsedProblems = parseQuestionFromText(question);

    if (parsedProblems.length > 0) {
        const answers = parsedProblems.map(p => {
            if (p.name === 'Nash Equilibrium') {
                const answer = determineNashEquilibrium(p.instance.matrix);
                const problemVisual = p.instance.text.startsWith('Joc parsată')
                    ? `Matricea analizată:\n${p.instance.visual}`
                    : `Exemplu (generat):\n${p.instance.visual}`;

                return `**${p.name}**:\n${problemVisual}\n\n**Răspuns: ${answer.strategy}**\n\n*Justificare*: ${answer.reason}`;
            } else {
                const answer = determineOptimalSearchStrategy(p.name, p.instance);
                return `**${p.name}** (${p.instance.text}):\n\n**Strategie optimă: ${answer.strategy}**\n\n*Justificare*: ${answer.reason}`;
            }
        });
        return answers.join('\n\n---\n\n');
    }

    const qLower = question.toLowerCase();

    if (qLower.includes('uninformed') || qLower.includes('neinformat')) {
        return `**Strategii Uninformed (fără heuristici)**\n\nAceste strategii nu disting între stări:\n\n• **BFS**: Găsește cel mai scurt drum (pentru costuri unitare)\n• **Iterative Deepening**: DFS cu limite, memorie redusă + completitudine\n• **Backtracking**: DFS cu pruning, elimină ramuri invalide (pentru CSP)\n\n**Când se folosesc**: Probleme mici/medii, lipsa heuristicilor bune.`;
    }
    if (qLower.includes('informed') || qLower.includes('heuristic')) {
        return `**Strategii Informed (cu heuristici)**\n\nFolosesc cunoștințe despre domeniu pentru a ghida căutarea:\n\n• **Greedy Best-First**: Rapid, neoptim, alege starea cu h(n) minim\n• **Simulated Annealing**: Scapă de minimele locale prin acceptarea probabilistică a soluțiilor mai slabe\n• **A***: Optim dacă h admisibilă, f(n) = g(n) + h(n)\n\n**Când se folosesc**: Probleme mari unde uninformed e prea lent, existența heuristicilor bune.`;
    }
    if (qLower.includes('a*') || qLower.includes('a star')) {
        return `**A* Search**\n\nA* este optim dacă euristica h(n) este admisibilă (h(n) ≤ cost real până la goal).\n\n**Formula**: f(n) = g(n) + h(n)\n- g(n) = cost de la start la n\n- h(n) = estimare cost de la n la goal\n\n**Avantaje**: Găsește soluția optimă, eficient cu euristică bună\n**Dezavantaje**: Memorie mare pentru probleme complexe`;
    }
    if (qLower.includes('backtracking')) {
        return `**Backtracking**\n\nBacktracking este un DFS cu pruning (eliminare timpurie a ramurilor invalide).\n\n**Când e optim**: Probleme CSP mici, precum N-Queens (N≤8) sau Sudoku.\n\n**Avantaje**: Elimină rapid căi imposibile, memorie redusă\n**Exemplu clasic**: Plasarea reginelor pe tablă, verificând conflictele înainte de a continua.`;
    }
    if (qLower.includes('nash equilibrium') || qLower.includes('echilibru nash')) {
        return `**Echilibrul Nash Pur**\n\n**Definiție**: O pereche de strategii (σ₁, σ₂) este un Echilibru Nash Pur dacă strategia fiecărui jucător este un **Cel Mai Bun Răspuns** (Best Response) la strategia celuilalt.\n\nP₁ joacă σ₁ maximizând utilitatea sa, presupunând că P₂ joacă σ₂. P₂ face același lucru.\n\n**Cum se găsește**:\n1. Pentru fiecare coloană, găsește cea mai bună strategie a P1\n2. Pentru fiecare rând, găsește cea mai bună strategie a P2\n3. Echilibrele sunt celulele unde ambele răspunsuri se intersectează`;
    }

    if (qLower.includes('database') || qLower.includes('baza de date')) {
        return `**Database Status** 📊\n\nBaza de date conține:\n• ${db.db.problemTypes.length} tipuri de probleme\n• ${db.db.searchStrategies.length} strategii de căutare (${db.db.searchStrategies.filter(s => s.type === 'Uninformed').length} Uninformed + ${db.db.searchStrategies.filter(s => s.type === 'Informed').length} Informed)\n• ${db.db.strategyRules.length} reguli de mapare\n• ${db.db.questionLog.length} întrebări generate\n\nÎntreabă despre orice strategie sau problemă specifică!`;
    }

    return `**Sunt gata să te ajut!** 🤖\n\nÎntreabă-mă despre:\n• Strategii de căutare (A*, Backtracking, Greedy, BFS, DFS)\n• Probleme specifice (N-Queens, Hanoi, Graph Coloring, Knight's Tour)\n• Echilibru Nash (inclusiv parsarea unei matrici)\n\n**Exemple de întrebări**:\n- "N-Queens cu N=10?"\n- "Hanoi 12 discuri 4 tije?"\n- "Nash Equilibrium (4,5) | (5,5) | (3,4) | (4,3)"\n- "Ce este A*?"`;
};

// ============================================================================
// API SERVICE (Using Database)
// ============================================================================

const generateSearchInstance = (problemName) => {
    const problemType = db.getProblemTypeByName(problemName);
    if (!problemType) return { text: 'Unknown problem', size: 5 };

    const config = db.getInstanceConfig(problemType.id);
    if (!config) return { text: 'No config found', size: 5 };

    const size = Math.floor(Math.random() * (config.max_size - config.min_size + 1)) + config.min_size;

    switch (problemName) {
        case 'N-Queens':
            return {
                text: `N=${size} (tablă ${size}x${size})`,
                n: size,
                size: size
            };

        case 'Generalized Hanoi': {
            const additionalParams = config.additional_params;
            const pegs = Math.floor(Math.random() * (additionalParams.pegs_max - additionalParams.pegs_min + 1)) + additionalParams.pegs_min;
            return {
                text: `${size} discuri, ${pegs} tije`,
                discs: size,
                pegs: pegs,
                size: size
            };
        }

        case 'Graph Coloring': {
            const additionalParams = config.additional_params;
            const colors = Math.floor(Math.random() * (additionalParams.colors_max - additionalParams.colors_min + 1)) + additionalParams.colors_min;
            const density = additionalParams.density_options[Math.floor(Math.random() * additionalParams.density_options.length)];

            const maxEdges = size * (size - 1) / 2;
            let edges;
            if (density === 'dens') {
                edges = Math.floor(maxEdges * (0.4 + Math.random() * 0.5));
            } else {
                edges = Math.floor(maxEdges * (0.1 + Math.random() * 0.2));
            }
            edges = Math.max(edges, size - 1);

            return {
                text: `Graf ${density} cu ${size} noduri, ${edges} muchii, ${colors} culori`,
                nodes: size,
                edges: edges,
                colors: colors,
                density: density,
                size: size
            };
        }

        case "Knight's Tour":
            return {
                text: `Tablă ${size}x${size}`,
                size: size
            };

        default:
            return { text: 'Instanță standard', size: 5 };
    }
};

const determineOptimalSearchStrategy = (problemName, instance) => {
    const problemType = db.getProblemTypeByName(problemName);
    if (!problemType) return { strategy: 'Unknown', reason: 'Problem not found', type: 'Search' };

    const size = instance.size || 5;
    const additionalConditions = {};

    // Build additional conditions based on problem type
    if (problemName === 'Generalized Hanoi' && instance.pegs) {
        additionalConditions.pegs = instance.pegs;
    }
    if (problemName === 'Graph Coloring' && instance.density) {
        additionalConditions.density = instance.density;
    }

    const rules = db.getStrategyRules(problemType.id, size, additionalConditions);

    if (rules.length === 0) {
        return { strategy: 'BFS', reason: 'No specific rule found, using default BFS.', type: 'Search' };
    }

    const selectedRule = rules[0]; // Highest priority rule
    const strategy = db.getStrategyById(selectedRule.strategy_id);

    return {
        strategy: strategy.name,
        reason: selectedRule.reason,
        type: 'Search'
    };
};

const generateNashInstance = () => {
    const config = db.getGameConfig();

    const rows = Math.floor(Math.random() * 4) + 2; // 2–5
    const cols = Math.floor(Math.random() * 4) + 2; // 2–5

    const matrix = Array(rows).fill(0).map(() =>
        Array(cols).fill(0).map(() => [
            Math.floor(Math.random() * (config.max_payoff + 1)),
            Math.floor(Math.random() * (config.max_payoff + 1))
        ])
    );

    // FORMAT CU ;
    const visual = matrix
        .map(r => r.map(c => `(${c[0]}, ${c[1]})`).join(" | "))
        .join(" ;\n");

    return {
        matrix,
        rows,
        cols,
        text: `Joc în formă normală ${rows}x${cols}`,
        visual
    };
};



const determineNashEquilibrium = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const equilibria = [];

    // arrays of arrays: pe fiecare col/rând poți avea mai multe best responses
    const player1BestResponses = Array.from({ length: cols }, () => []);
    const player2BestResponses = Array.from({ length: rows }, () => []);

    // Best responses for Player 1 (column-based)
    for (let j = 0; j < cols; j++) {
        let maxPayoff = -Infinity;

        for (let i = 0; i < rows; i++) {
            const payoff = matrix[i][j][0];

            if (payoff > maxPayoff) {
                maxPayoff = payoff;
                player1BestResponses[j] = [i]; // reset
            } else if (payoff === maxPayoff) {
                player1BestResponses[j].push(i); // keep ties
            }
        }
    }

    // Best responses for Player 2 (row-based)
    for (let i = 0; i < rows; i++) {
        let maxPayoff = -Infinity;

        for (let j = 0; j < cols; j++) {
            const payoff = matrix[i][j][1];

            if (payoff > maxPayoff) {
                maxPayoff = payoff;
                player2BestResponses[i] = [j]; // reset
            } else if (payoff === maxPayoff) {
                player2BestResponses[i].push(j); // keep ties
            }
        }
    }

    // intersections = Nash equilibria
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (player1BestResponses[j].includes(i) && player2BestResponses[i].includes(j)) {
                equilibria.push(`(Rând ${i + 1}, Coloana ${j + 1})`);
            }
        }
    }

    let strategyText, reasonText;

    if (equilibria.length === 0) {
        strategyText = 'NU există';
        reasonText = 'Niciun echilibru Nash pur.';
    } else {
        strategyText = equilibria.join('; ');
        reasonText = `Echilibrele Nash Pure sunt: ${strategyText}.`;
    }

    return {
        strategy: strategyText,
        reason: reasonText,
        type: 'GameTheory',
        rawEquilibria: equilibria
    };
};


const generateQuestion = (type) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (type === 'search') {
                const searchProblems = db.getAllProblemTypes('Search');
                const selectedProblem = searchProblems[Math.floor(Math.random() * searchProblems.length)];
                const instance = generateSearchInstance(selectedProblem.name);
                const correctAnswer = determineOptimalSearchStrategy(selectedProblem.name, instance);

                // Run algorithm comparison
                const comparisonResults = runAlgorithmComparison(selectedProblem.name, instance);
                const bestStrategy = selectBestStrategy(comparisonResults);

                const question = {
                    id: Date.now(),
                    problem: { ...selectedProblem, instance },
                    correctAnswer: correctAnswer,
                    type: 'Search',
                    text: `Pentru problema **${selectedProblem.name}** cu instanța:\n\n${instance.text}\n\nCare este cea mai potrivită strategie de rezolvare?`,
                    comparisonResults: comparisonResults,
                    bestStrategy: bestStrategy
                };

                db.logQuestion(selectedProblem.id, instance, correctAnswer);
                resolve(question);
            } else if (type === 'nash') {
                const nashProblem = db.getProblemTypeByName('Nash Equilibrium');
                const instance = generateNashInstance();
                const correctAnswer = determineNashEquilibrium(instance.matrix);

                const question = {
                    id: Date.now(),
                    problem: { ...nashProblem, instance },
                    correctAnswer: correctAnswer,
                    type: 'GameTheory',
                    text: `Pentru jocul dat în forma normală cu plățile (P1, P2):\n\n${instance.visual}\n\n**Există Echilibru Nash Pur? Care este acesta?**`
                };

                db.logQuestion(nashProblem.id, instance, correctAnswer);
                resolve(question);
            }
        }, 800);
    });
};

const evaluateAnswer = (question, userAnswer) => {
    const { type, correctAnswer } = question;
    const userAnswerLower = userAnswer.toLowerCase().trim();
    let score = 0;
    let feedback = '';

    if (type === 'Search') {
        const correctStrategyLower = correctAnswer.strategy.toLowerCase();

        if (userAnswerLower.includes(correctStrategyLower)) {
            score = 100;
            feedback = `Excelent! ${correctAnswer.strategy} este strategia optimă pentru această instanță.`;
        } else {
            const allStrategies = db.db.searchStrategies;
            let foundStrategy = null;

            for (const strategy of allStrategies) {
                if (userAnswerLower.includes(strategy.name.toLowerCase())) {
                    foundStrategy = strategy.name;
                    break;
                }
            }

            if (foundStrategy) {
                score = 40;
                feedback = `Răspunsul tău menționează ${foundStrategy}, dar ${correctAnswer.strategy} este mai eficient pentru această instanță specifică.`;
            } else {
                score = 0;
                feedback = `Răspunsul nu menționează o strategie validă sau este neclar.`;
            }
        }
    } else if (type === 'GameTheory') {
        const correctNash = correctAnswer.rawEquilibria;
        let userIsCorrect = false;

        if (correctNash.length === 0) {
            userIsCorrect = userAnswerLower.includes('nu există') || userAnswerLower.includes('no nash');
        } else {
            const correctMatches = correctNash.filter(eq =>
                userAnswerLower.includes(eq.toLowerCase().replace(/[()]/g, ''))
            ).length;
            if (correctMatches === correctNash.length) {
                userIsCorrect = true;
            }
        }

        if (userIsCorrect) {
            score = 100;
            feedback = `Corect! Echilibrul Nash Pur este ${correctAnswer.strategy}.`;
        } else if (correctNash.length > 0 && userAnswerLower.includes(correctNash[0].toLowerCase().replace(/[()]/g, ''))) {
            score = 70;
            feedback = `Aproape! Ai identificat un echilibru corect, dar există mai multe. Echilibrele corecte sunt ${correctAnswer.strategy}.`;
        } else {
            score = 0;
            feedback = `Răspuns incorect. Verifică din nou Cel Mai Bun Răspuns al fiecărui jucător.`;
        }
    }

    return { score, feedback, correctAnswer };
};

// ============================================================================
// REACT COMPONENT
// ============================================================================

const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '24px' },
    maxWidth: { maxWidth: '1152px', margin: '0 auto' },
    card: { background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', marginBottom: '24px' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
    title: { fontSize: '30px', fontWeight: 'bold', color: '#1f2937' },
    subtitle: { color: '#4b5563', marginBottom: '16px' },
    dbInfo: { background: '#f0fdf4', borderRadius: '8px', padding: '12px', border: '1px solid #86efac', marginTop: '16px' },
    dbLabel: { fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '4px' },
    dbText: { fontSize: '14px', color: '#15803d' },
    navContainer: { background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '24px', padding: '8px' },
    navButtons: { display: 'flex', gap: '8px' },
    navButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', fontWeight: '500', transition: 'all 0.3s', border: 'none', cursor: 'pointer' },
    navButtonActive: { background: '#4f46e5', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
    navButtonInactive: { color: '#4b5563', background: 'transparent' },
    button: { width: '100%', background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '16px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' },
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    questionBox: { background: '#eef2ff', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
    questionText: { color: '#374151', whiteSpace: 'pre-line', fontWeight: '500', fontSize: '18px' },
    problemBox: { background: '#f9fafb', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #818cf8' },
    problemTitle: { fontWeight: 'bold', color: '#4338ca', fontSize: '18px', marginBottom: '8px' },
    problemDesc: { fontSize: '14px', color: '#4b5563', marginBottom: '12px' },
    instanceBox: { background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #c7d2fe' },
    instanceLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px' },
    instanceText: { fontWeight: '600', color: '#1f2937', whiteSpace: 'pre-line' },
    textarea: { width: '100%', height: '128px', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px', resize: 'none', fontFamily: 'inherit', fontSize: '14px', outline: 'none' },
    submitButton: { marginTop: '16px', width: '100%', background: '#16a34a', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s' },
    evaluationCard: { background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px' },
    scoreContainer: { marginBottom: '24px' },
    scoreRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' },
    scoreLabel: { color: '#374151', fontWeight: '500' },
    scoreValue: { fontSize: '24px', fontWeight: 'bold' },
    progressBar: { width: '100%', background: '#e5e7eb', borderRadius: '9999px', height: '12px' },
    progressFill: { height: '12px', borderRadius: '9999px', transition: 'all 0.3s' },
    feedbackBox: { background: '#dbeafe', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
    feedbackLabel: { fontSize: '14px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' },
    feedbackText: { color: '#374151' },
    correctBox: { background: '#dcfce7', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
    correctLabel: { fontSize: '14px', fontWeight: '600', color: '#14532d', marginBottom: '8px' },
    correctAnswer: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    reasonBox: { background: '#faf5ff', borderRadius: '8px', padding: '16px' },
    reasonLabel: { fontSize: '14px', fontWeight: '600', color: '#581c87', marginBottom: '8px' },
    reasonText: { color: '#374151' },
    comparisonBox: { background: '#f0f9ff', borderRadius: '12px', padding: '16px', marginTop: '16px', borderLeft: '4px solid #0284c7' },
    comparisonTitle: { fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
    comparisonTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    comparisonTh: { background: '#e0f2fe', padding: '8px', textAlign: 'left', fontWeight: '600', color: '#0c4a6e', borderBottom: '2px solid #0284c7' },
    comparisonTd: { padding: '8px', borderBottom: '1px solid #bae6fd', color: '#164e63' },
    comparisonBest: { background: '#cffafe', fontWeight: '600', color: '#0c4a6e' },
    questionTypeSelector: { display: 'flex', gap: '12px', marginBottom: '16px', padding: '0 8px' },
    typeButton: { flex: 1, padding: '12px 16px', borderRadius: '12px', fontWeight: '600', border: '2px solid #e5e7eb', cursor: 'pointer', background: 'white', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    typeButtonActive: { borderColor: '#4f46e5', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', background: '#eef2ff', color: '#4f46e5' },
    chatContainer: { background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', height: '600px', display: 'flex', flexDirection: 'column' },
    chatHeader: { padding: '24px', borderBottom: '1px solid #e5e7eb' },
    chatTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1f2937' },
    chatSubtitle: { fontSize: '14px', color: '#4b5563' },
    chatMessages: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
    chatEmpty: { textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' },
    chatEmptyIcon: { width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' },
    chatEmptyText: { color: '#6b7280', marginBottom: '24px' },
    suggestionGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '672px', margin: '0 auto' },
    suggestionButton: { fontSize: '14px', background: '#eef2ff', color: '#4338ca', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'left' },
    messageRow: { display: 'flex' },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowAssistant: { justifyContent: 'flex-start' },
    messageBubble: { maxWidth: '80%', borderRadius: '16px', padding: '16px' },
    messageBubbleUser: { background: '#4f46e5', color: 'white' },
    messageBubbleAssistant: { background: '#f3f4f6', color: '#1f2937' },
    messageText: { whiteSpace: 'pre-wrap', fontSize: '14px' },
    chatInput: { padding: '24px', borderTop: '1px solid #e5e7eb' },
    chatInputRow: { display: 'flex', gap: '8px' },
    input: { flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none' },
    sendButton: { background: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }
};

const SmarTestApp = () => {
    const [activeTab, setActiveTab] = useState('generator');
    const [questionType, setQuestionType] = useState('search');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateQuestion = async () => {
        setIsGenerating(true);
        setEvaluation(null);
        setUserAnswer('');
        const question = await generateQuestion(questionType);
        setCurrentQuestion(question);
        setIsGenerating(false);
    };

    const handleEvaluateAnswer = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;
        const result = evaluateAnswer(currentQuestion, userAnswer);
        setEvaluation(result);
    };

    const handleChatSubmit = () => {
        if (!chatInput.trim()) return;
        const userMessage = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMessage]);
        const currentInput = chatInput;
        setChatInput('');

        setTimeout(() => {
            const response = generateChatResponse(currentInput);
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }, 500);
    };

    const QuestionTypeSelector = () => (
        <div style={styles.questionTypeSelector}>
            <button onClick={() => { setQuestionType('search'); setCurrentQuestion(null); setEvaluation(null); setUserAnswer(''); }} style={{ ...styles.typeButton, ...(questionType === 'search' ? styles.typeButtonActive : {}) }}>
                <Sparkles style={{ width: '20px', height: '20px' }} />
                Strategii Căutare
            </button>
            <button onClick={() => { setQuestionType('nash'); setCurrentQuestion(null); setEvaluation(null); setUserAnswer(''); }} style={{ ...styles.typeButton, ...(questionType === 'nash' ? styles.typeButtonActive : {}) }}>
                <Box style={{ width: '20px', height: '20px' }} />
                Echilibru Nash
            </button>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.maxWidth}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <Database style={{ width: '32px', height: '32px', color: '#4f46e5' }} />
                        <h1 style={styles.title}>SmarTest AI - SQLite Database</h1>
                    </div>
                    <p style={styles.subtitle}>Sistem cu bază de date SQLite pentru generarea și evaluarea întrebărilor AI</p>
                    <div style={styles.dbInfo}>
                        <p style={styles.dbLabel}>📊 Database Status:</p>
                        <p style={styles.dbText}>
                            ✅ {db.db.problemTypes.length} Problem Types | {db.db.searchStrategies.length} Strategies | {db.db.strategyRules.length} Rules | {db.db.questionLog.length} Generated Questions
                        </p>
                    </div>
                </div>

                <div style={styles.navContainer}>
                    <div style={styles.navButtons}>
                        <button onClick={() => setActiveTab('generator')} style={{ ...styles.navButton, ...(activeTab === 'generator' ? styles.navButtonActive : styles.navButtonInactive) }}>
                            <Sparkles style={{ width: '20px', height: '20px' }} />
                            Generator Întrebări
                        </button>
                        <button onClick={() => setActiveTab('chat')} style={{ ...styles.navButton, ...(activeTab === 'chat' ? styles.navButtonActive : styles.navButtonInactive) }}>
                            <MessageSquare style={{ width: '20px', height: '20px' }} />
                            Agent Conversațional
                        </button>
                    </div>
                </div>

                {activeTab === 'generator' && (
                    <div>
                        <div style={styles.card}>
                            <QuestionTypeSelector />
                            <button onClick={handleGenerateQuestion} disabled={isGenerating} style={{ ...styles.button, ...(isGenerating ? styles.buttonDisabled : {}) }}>
                                {isGenerating ? <><RotateCcw style={{ width: '20px', height: '20px' }} /> Se generează...</> : <><Sparkles style={{ width: '20px', height: '20px' }} /> Generează Întrebare Nouă</>}
                            </button>
                        </div>

                        {currentQuestion && (
                            <>
                                <div style={styles.card}>
                                    <div style={styles.header}>
                                        <FileText style={{ width: '24px', height: '24px', color: '#4f46e5' }} />
                                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                                            Întrebarea {currentQuestion.type === 'GameTheory' ? '(Teoria Jocurilor)' : '(Strategii de Căutare)'}
                                        </h2>
                                    </div>
                                    <div style={styles.questionBox}>
                                        <p style={styles.questionText}>{currentQuestion.text}</p>
                                    </div>
                                    <div style={styles.problemBox}>
                                        <h4 style={styles.problemTitle}>{currentQuestion.problem.name}</h4>
                                        <p style={styles.problemDesc}>{currentQuestion.problem.description}</p>
                                        <div style={styles.instanceBox}>
                                            <p style={styles.instanceLabel}>Instanță Detaliată:</p>
                                            <p style={styles.instanceText}>{currentQuestion.problem.instance.text}</p>
                                            {currentQuestion.type === 'GameTheory' && currentQuestion.problem.instance.visual && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <p style={styles.instanceLabel}>Matricea (P1, P2):</p>
                                                    <pre style={styles.instanceText}>{currentQuestion.problem.instance.visual}</pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {currentQuestion.type === 'Search' && currentQuestion.comparisonResults && currentQuestion.comparisonResults.length > 0 && evaluation && (
                                        <div style={styles.comparisonBox}>
                                            <div style={styles.comparisonTitle}>
                                                <Zap style={{ width: '16px', height: '16px' }} />
                                                Comparație Algoritmi - Rezultate Execuție
                                            </div>
                                            <table style={styles.comparisonTable}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.comparisonTh}>Algoritm</th>
                                                        <th style={styles.comparisonTh}>Status</th>
                                                        <th style={styles.comparisonTh}>Timp (ms)</th>
                                                        <th style={styles.comparisonTh}>Noduri Explorate</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentQuestion.comparisonResults.map((result, idx) => (
                                                        <tr key={idx} style={currentQuestion.bestStrategy && result === currentQuestion.bestStrategy ? { background: '#cffafe' } : {}}>
                                                            <td style={{ ...styles.comparisonTd, fontWeight: currentQuestion.bestStrategy && result === currentQuestion.bestStrategy ? '600' : 'normal' }}>
                                                                {result.strategyUsed}
                                                                {currentQuestion.bestStrategy && result === currentQuestion.bestStrategy && ' ⭐'}
                                                            </td>
                                                            <td style={styles.comparisonTd}>
                                                                {result.found ? '✅ Soluție găsită' : '⚠️ Nu s-a găsi'}
                                                            </td>
                                                            <td style={{ ...styles.comparisonTd, fontWeight: 'bold', color: result === currentQuestion.bestStrategy ? '#0c4a6e' : '#164e63' }}>
                                                                {result.executionTime}
                                                            </td>
                                                            <td style={styles.comparisonTd}>{result.nodesExplored}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {currentQuestion.bestStrategy && (
                                                <div style={{ marginTop: '12px', padding: '8px', background: '#d1fae5', borderRadius: '6px', fontSize: '13px', color: '#065f46' }}>
                                                    <strong>Cel mai rapid:</strong> {currentQuestion.bestStrategy.strategyUsed} - {currentQuestion.bestStrategy.executionTime}ms
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.card}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Răspunsul Tău</h3>
                                    <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Introdu răspunsul..." style={styles.textarea} />
                                    <button onClick={handleEvaluateAnswer} disabled={!userAnswer.trim()} style={{ ...styles.submitButton, ...(!userAnswer.trim() ? styles.buttonDisabled : {}) }}>
                                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                                        Evaluează Răspunsul
                                    </button>
                                </div>

                                {evaluation && (
                                    <div style={styles.evaluationCard}>
                                        <div style={styles.header}>
                                            {evaluation.score >= 70 ? <CheckCircle style={{ width: '24px', height: '24px', color: '#16a34a' }} /> : <AlertCircle style={{ width: '24px', height: '24px', color: '#ea580c' }} />}
                                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>Evaluare</h3>
                                        </div>
                                        <div style={styles.scoreContainer}>
                                            <div style={styles.scoreRow}>
                                                <span style={styles.scoreLabel}>Scor</span>
                                                <span style={{ ...styles.scoreValue, color: evaluation.score >= 70 ? '#16a34a' : '#ea580c' }}>{evaluation.score}%</span>
                                            </div>
                                            <div style={styles.progressBar}>
                                                <div style={{ ...styles.progressFill, width: `${evaluation.score}%`, background: evaluation.score >= 70 ? '#16a34a' : '#ea580c' }} />
                                            </div>
                                        </div>
                                        <div style={styles.feedbackBox}>
                                            <p style={styles.feedbackLabel}>Feedback</p>
                                            <p style={styles.feedbackText}>{evaluation.feedback}</p>
                                        </div>
                                        <div style={styles.correctBox}>
                                            <p style={styles.correctLabel}>Răspuns Corect</p>
                                            <p style={styles.correctAnswer}>{evaluation.correctAnswer.strategy}</p>
                                        </div>
                                        <div style={styles.reasonBox}>
                                            <p style={styles.reasonLabel}>Justificare Detaliată</p>
                                            <p style={styles.reasonText}>{evaluation.correctAnswer.reason}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div style={styles.chatContainer}>
                        <div style={styles.chatHeader}>
                            <h2 style={styles.chatTitle}>Agent Conversațional AI</h2>
                            <p style={styles.chatSubtitle}>Powered by SQLite Database</p>
                        </div>
                        <div style={styles.chatMessages}>
                            {chatMessages.length === 0 ? (
                                <div style={styles.chatEmpty}>
                                    <MessageSquare style={styles.chatEmptyIcon} />
                                    <p style={styles.chatEmptyText}>Începe o conversație!</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div key={idx} style={{ ...styles.messageRow, ...(msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant) }}>
                                        <div style={{ ...styles.messageBubble, ...(msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant) }}>
                                            <pre style={styles.messageText}>{msg.content}</pre>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div style={styles.chatInput}>
                            <div style={styles.chatInputRow}>
                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()} placeholder="Scrie întrebarea..." style={styles.input} />
                                <button onClick={handleChatSubmit} disabled={!chatInput.trim()} style={{ ...styles.sendButton, ...(!chatInput.trim() ? styles.buttonDisabled : {}) }}>
                                    <Send style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmarTestApp
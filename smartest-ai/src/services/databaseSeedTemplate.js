/**
 * Database Seed with Complete Template System
 * This file populates the Postgres database with all question templates,
 * difficulty configurations, and instance generators.
 * 
 * NO hardcoding in the application - everything comes from the database.
 */

const DATABASE_SEED = {
    // Problem Types
    problem_types: [
        {
            id: 1,
            name: 'search',
            description: 'Search strategy problems (BFS, DFS, A*)',
            category: 'algorithms'
        },
        {
            id: 2,
            name: 'nash',
            description: 'Nash Equilibrium game theory problems',
            category: 'game_theory'
        },
        {
            id: 3,
            name: 'csp',
            description: 'Constraint Satisfaction Problems',
            category: 'algorithms'
        },
        {
            id: 4,
            name: 'adversarial',
            description: 'Adversarial search (Minimax, Alpha-Beta)',
            category: 'algorithms'
        }
    ],

    // Search Strategies (for Search Questions)
    search_strategies: [
        { id: 1, name: 'BFS', type: 'uninformed', description: 'Breadth-First Search' },
        { id: 2, name: 'DFS', type: 'uninformed', description: 'Depth-First Search' },
        { id: 3, name: 'A*', type: 'informed', description: 'A* Search with heuristic' },
        { id: 4, name: 'Greedy Best-First', type: 'informed', description: 'Greedy Best-First Search' }
    ],

    // Question Templates - ZERO hardcoding, all in database
    question_templates: [
        {
            id: 1,
            type: 'search',
            name: 'Search Strategy Selection',
            text_template: `## Search Problem: {{problemName}}

### Problem Description
You need to find a path from the start node to the goal node in this graph.

### Graph Structure
{{visualization}}

**Nodes:** {{nodeCount}}
**Edges:** {{edgeCount}}
**Start Node:** {{startNode}}
**Goal Node:** {{goalNode}}

### Constraints and Properties
- Graph Type: {{graphType}} (can be tree or general graph)
- Branching Factor: {{branchingFactor}}
- Estimated Depth: {{estimatedDepth}}
- Solution Cost Type: {{costType}}

### Question
Given the above graph characteristics, which search strategy would be MOST appropriate and efficient for this problem?

**Hint:** Consider the nature of the problem (informed vs uninformed search), the estimated depth, and whether a heuristic function might be available.`,
            description: 'Question about selecting the best search strategy',
            answer_format: 'strategy_name',
            evaluation_type: 'strategy_match'
        },

        {
            id: 2,
            type: 'nash',
            name: 'Nash Equilibrium Finding',
            text_template: `## Game Theory: Nash Equilibrium

### Payoff Matrix
Below is a 2-player game where Player 1 (rows) is the maximizer and Player 2 (columns) is the minimizer.

**Payoff format:** (Player 1 payoff, Player 2 payoff)

{{matrix}}

### Problem
Find all Nash Equilibria for this game. A Nash Equilibrium is a pair of strategies where neither player can improve their payoff by unilaterally changing their strategy.

**Indicate your answer as:** (row_index, column_index)
- Use 1-based indexing (first row/column is 1)
- If multiple equilibria exist, list them in order: (r1,c1) (r2,c2) ...
- If no pure strategy equilibrium exists, write: "No pure strategy Nash Equilibrium"`,
            description: 'Question about finding Nash Equilibria in payoff matrices',
            answer_format: 'equilibrium_pair',
            evaluation_type: 'nash_match'
        },

        {
            id: 3,
            type: 'csp',
            name: 'Constraint Satisfaction Problem',
            text_template: `## Constraint Satisfaction Problem (CSP)

### Variables and Domains
{{variablesList}}

### Constraints
{{constraintsList}}

### Optimization Method
Using {{optimization}}: {{optimizationDescription}}

### Problem
Solve this CSP by finding an assignment of values to all variables that satisfies all constraints.

**Answer format:** var1=value, var2=value, var3=value, ...
- One assignment per line or comma-separated
- Must satisfy ALL constraints
- Variables should appear in alphabetical order in your answer`,
            description: 'Constraint Satisfaction Problem with various optimization techniques',
            answer_format: 'assignment_set',
            evaluation_type: 'assignment_match'
        },

        {
            id: 4,
            type: 'adversarial',
            name: 'Minimax and Game Tree',
            text_template: `## Adversarial Search: Minimax Algorithm

### Game Tree Structure
{{treeStructure}}

**Maximum depth:** {{maxDepth}}
**Leaf nodes:** {{leafCount}}
**Branching factor:** {{branchingFactor}}

### Leaf Node Values
The values at the leaf nodes of the game tree are:
{{leafValues}}

### Problem
Apply the {{algorithm}} algorithm to this game tree.

**Answer format:** root_value visited_leaf_count
- First number: The minimax value at the root of the tree
- Second number: How many leaf nodes were evaluated
- Example: 8 12

**Note:** If using alpha-beta pruning, only count non-pruned leaves.`,
            description: 'Minimax and adversarial search in game trees',
            answer_format: 'numeric_pair',
            evaluation_type: 'numeric_match'
        }
    ],

    // Difficulty Configurations - store ALL instance generation parameters
    difficulty_configs: [
        // SEARCH - Easy
        {
            question_type: 'search',
            difficulty: 'easy',
            config_json: JSON.stringify({
                problem_names: ['nQueens', 'hanoi'],
                node_count: { min: 4, max: 5 },
                edge_count: { min: 4, max: 6 },
                branching_factor: { min: 2, max: 2 },
                estimated_depth: { min: 2, max: 3 },
                graph_type: 'tree',
                cost_type: 'uniform'
            })
        },
        // SEARCH - Medium
        {
            question_type: 'search',
            difficulty: 'medium',
            config_json: JSON.stringify({
                problem_names: ['nQueens', 'hanoi', 'graphSearch'],
                node_count: { min: 6, max: 8 },
                edge_count: { min: 8, max: 12 },
                branching_factor: { min: 2, max: 3 },
                estimated_depth: { min: 3, max: 4 },
                graph_type: 'general',
                cost_type: 'uniform'
            })
        },
        // SEARCH - Hard
        {
            question_type: 'search',
            difficulty: 'hard',
            config_json: JSON.stringify({
                problem_names: ['nQueens', 'hanoi', 'graphSearch', 'knightTour'],
                node_count: { min: 10, max: 15 },
                edge_count: { min: 15, max: 25 },
                branching_factor: { min: 3, max: 4 },
                estimated_depth: { min: 4, max: 6 },
                graph_type: 'general',
                cost_type: 'variable'
            })
        },

        // NASH - Easy
        {
            question_type: 'nash',
            difficulty: 'easy',
            config_json: JSON.stringify({
                matrix_rows: { min: 2, max: 2 },
                matrix_cols: { min: 2, max: 2 },
                payoff_range: { min: 0, max: 5 },
                equilibria_count: { min: 1, max: 1 },
                has_dominant_strategy: true
            })
        },
        // NASH - Medium
        {
            question_type: 'nash',
            difficulty: 'medium',
            config_json: JSON.stringify({
                matrix_rows: { min: 2, max: 3 },
                matrix_cols: { min: 2, max: 3 },
                payoff_range: { min: 0, max: 10 },
                equilibria_count: { min: 1, max: 2 },
                has_dominant_strategy: false
            })
        },
        // NASH - Hard
        {
            question_type: 'nash',
            difficulty: 'hard',
            config_json: JSON.stringify({
                matrix_rows: { min: 3, max: 4 },
                matrix_cols: { min: 3, max: 4 },
                payoff_range: { min: -5, max: 15 },
                equilibria_count: { min: 1, max: 3 },
                has_dominant_strategy: false,
                has_mixed_strategy: true
            })
        },

        // CSP - Easy
        {
            question_type: 'csp',
            difficulty: 'easy',
            config_json: JSON.stringify({
                variable_count: { min: 2, max: 3 },
                domain_size: { min: 2, max: 3 },
                constraint_count: { min: 1, max: 2 },
                constraint_types: ['inequality', 'difference'],
                optimizations: ['AC-3'],
                time_limit: 5000
            })
        },
        // CSP - Medium
        {
            question_type: 'csp',
            difficulty: 'medium',
            config_json: JSON.stringify({
                variable_count: { min: 3, max: 4 },
                domain_size: { min: 3, max: 4 },
                constraint_count: { min: 2, max: 3 },
                constraint_types: ['inequality', 'difference', 'less_than', 'greater_than'],
                optimizations: ['AC-3', 'MRV', 'Forward Checking'],
                time_limit: 8000
            })
        },
        // CSP - Hard
        {
            question_type: 'csp',
            difficulty: 'hard',
            config_json: JSON.stringify({
                variable_count: { min: 4, max: 6 },
                domain_size: { min: 4, max: 6 },
                constraint_count: { min: 3, max: 5 },
                constraint_types: ['inequality', 'difference', 'less_than', 'greater_than', 'all_different'],
                optimizations: ['AC-3', 'MRV', 'Forward Checking', 'LCV'],
                time_limit: 10000
            })
        },

        // ADVERSARIAL - Easy
        {
            question_type: 'adversarial',
            difficulty: 'easy',
            config_json: JSON.stringify({
                max_depth: 2,
                branching_factor: { min: 2, max: 2 },
                leaf_count: { min: 4, max: 4 },
                algorithm: 'Minimax',
                include_alpha_beta: false
            })
        },
        // ADVERSARIAL - Medium
        {
            question_type: 'adversarial',
            difficulty: 'medium',
            config_json: JSON.stringify({
                max_depth: 3,
                branching_factor: { min: 2, max: 3 },
                leaf_count: { min: 8, max: 12 },
                algorithm: 'Minimax',
                include_alpha_beta: false
            })
        },
        // ADVERSARIAL - Hard
        {
            question_type: 'adversarial',
            difficulty: 'hard',
            config_json: JSON.stringify({
                max_depth: 4,
                branching_factor: { min: 2, max: 3 },
                leaf_count: { min: 16, max: 27 },
                algorithm: 'Minimax',
                include_alpha_beta: true,
                with_alpha_beta: { min: 16, max: 20 } // nodes evaluated with pruning
            })
        }
    ],

    // Instance Generators - Maps templates to generation functions
    instance_generators: [
        {
            question_type: 'search',
            generator_name: 'generateSearchInstance',
            params_mapping: JSON.stringify({
                difficulty: 'difficulty',
                node_count_range: 'config.node_count',
                edge_count_range: 'config.edge_count',
                branching_factor: 'config.branching_factor',
                estimated_depth: 'config.estimated_depth'
            })
        },
        {
            question_type: 'nash',
            generator_name: 'generateNashInstance',
            params_mapping: JSON.stringify({
                rows_range: 'config.matrix_rows',
                cols_range: 'config.matrix_cols',
                payoff_range: 'config.payoff_range'
            })
        },
        {
            question_type: 'csp',
            generator_name: 'generateRandomCSPInstance',
            params_mapping: JSON.stringify({
                variable_count: 'config.variable_count',
                domain_size: 'config.domain_size',
                constraint_count: 'config.constraint_count',
                optimization: 'config.optimizations[0]'
            })
        },
        {
            question_type: 'adversarial',
            generator_name: 'generateAdversarialInstance',
            params_mapping: JSON.stringify({
                max_depth: 'config.max_depth',
                branching_factor: 'config.branching_factor',
                algorithm: 'config.algorithm'
            })
        }
    ],

    // Evaluation Rules - Database-driven scoring logic
    evaluation_rules: [
        {
            question_type: 'search',
            scoring_json: JSON.stringify({
                type: 'strategy_match',
                exact_match_score: 100,
                partial_match_score: (matched, total) => (matched / total) * 70,
                match_keywords: ['BFS', 'DFS', 'A*', 'Greedy'],
                case_insensitive: true,
                description: 'Score based on strategy name matching'
            })
        },
        {
            question_type: 'nash',
            scoring_json: JSON.stringify({
                type: 'nash_match',
                exact_match_score: 100,
                partial_credit_formula: (matched, total) => (matched / total) * 60 + 10,
                max_score: 95,
                description: 'Nash equilibrium matching with partial credit'
            })
        },
        {
            question_type: 'csp',
            scoring_json: JSON.stringify({
                type: 'assignment_match',
                exact_match_score: 100,
                partial_match_score: (matched_vars, total_vars) => (matched_vars / total_vars) * 80,
                constraint_violation_penalty: 10,
                description: 'CSP assignment matching with constraint validation'
            })
        },
        {
            question_type: 'adversarial',
            scoring_json: JSON.stringify({
                type: 'numeric_pair_match',
                exact_match_score: 100,
                root_value_match_score: 50,
                leaf_count_tolerance: 2,
                description: 'Minimax root value and leaf count matching'
            })
        }
    ]
};

export default DATABASE_SEED;

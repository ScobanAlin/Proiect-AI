import { db } from '../services/database';
import { runAlgorithmComparison, selectBestStrategy, runCSPComparison, generateAdversarialInstance, solveMinimaxAlphaBeta } from './algorithmSolvers';
import { determineNashEquilibrium } from './strategyDeterminer';
import { generateRandomCSPInstance } from './cspGenerator';

export const generateSearchInstance = (problemName, difficultyConfig = {}) => {
    const problemType = db.getProblemTypeByName(problemName);
    if (!problemType) return { text: 'Unknown problem', size: 5 };

    const config = db.getInstanceConfig(problemType.id);
    if (!config) return { text: 'No config found', size: 5 };

    // Override with difficulty config if provided
    const minSize = difficultyConfig.minSize || config.min_size;
    const maxSize = difficultyConfig.maxSize || config.max_size;
    const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

    switch (problemName) {
        case 'N-Queens':
            return { text: `N=${size} (tablă ${size}x${size})`, n: size, size };

        case 'Generalized Hanoi': {
            const { pegs_min, pegs_max } = config.additional_params;
            const pegs = Math.floor(Math.random() * (pegs_max - pegs_min + 1)) + pegs_min;
            return { text: `${size} discuri, ${pegs} tije`, discs: size, pegs, size };
        }

        case 'Graph Coloring': {
            const { colors_min, colors_max, density_options } = config.additional_params;
            const colors = Math.floor(Math.random() * (colors_max - colors_min + 1)) + colors_min;
            const density = density_options[Math.floor(Math.random() * density_options.length)];
            const maxEdges = size * (size - 1) / 2;
            const edges = difficultyConfig.graphEdges || (density === 'dens'
                ? Math.floor(maxEdges * (0.4 + Math.random() * 0.5))
                : Math.floor(maxEdges * (0.1 + Math.random() * 0.2)));

            return {
                text: `Graf ${density} cu ${size} noduri, ${Math.max(edges, size - 1)} muchii, ${colors} culori`,
                nodes: size,
                edges: Math.max(edges, size - 1),
                colors,
                density,
                size
            };
        }

        case "Knight's Tour":
            return { text: `Tablă ${size}x${size}`, size };

        default:
            return { text: 'Instanță standard', size: 5 };
    }
};

export const generateNashInstance = (difficultyConfig = {}) => {
    const config = db.getGameConfig();

    // Extract difficulty level or use defaults
    let rowRange = { min: 2, max: 4 };
    let colRange = { min: 2, max: 4 };

    if (difficultyConfig.difficulty === 'easy') {
        rowRange = { min: 2, max: 2 };
        colRange = { min: 2, max: 3 };
    } else if (difficultyConfig.difficulty === 'medium') {
        rowRange = { min: 2, max: 3 };
        colRange = { min: 2, max: 4 };
    } else if (difficultyConfig.difficulty === 'hard') {
        rowRange = { min: 3, max: 4 };
        colRange = { min: 3, max: 5 };
    }

    // Override with explicit ranges if provided
    rowRange = difficultyConfig.nashRows || rowRange;
    colRange = difficultyConfig.nashCols || colRange;

    const rows = Math.floor(Math.random() * (rowRange.max - rowRange.min + 1)) + rowRange.min;
    const cols = Math.floor(Math.random() * (colRange.max - colRange.min + 1)) + colRange.min;

    const matrix = Array(rows).fill(0).map(() =>
        Array(cols).fill(0).map(() => [
            Math.floor(Math.random() * (config.max_payoff + 1)),
            Math.floor(Math.random() * (config.max_payoff + 1))
        ])
    );

    const visual = matrix
        .map(r => r.map(c => `(${c[0]}, ${c[1]})`).join(" | "))
        .join(" ;\n");

    return { matrix, rows, cols, text: `Joc în formă normală ${rows}x${cols}`, visual };
};

export const generateQuestion = (type, difficultyConfig = {}) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (type === 'search') {
                const searchProblems = db.getAllProblemTypes('Search');
                const selectedProblem = searchProblems[Math.floor(Math.random() * searchProblems.length)];
                const instance = generateSearchInstance(selectedProblem.name, difficultyConfig);
                const comparisonResults = runAlgorithmComparison(selectedProblem.name, instance);
                const bestStrategy = selectBestStrategy(comparisonResults);

                const correctAnswer = {
                    strategy: bestStrategy.strategyUsed,
                    reason: `Strategia ${bestStrategy.strategyUsed} este cea mai rapidă pentru această instanță (${bestStrategy.executionTime}ms), explorând ${bestStrategy.nodesExplored} noduri.`,
                    type: 'Search'
                };

                const question = {
                    id: Date.now(),
                    problem: { ...selectedProblem, instance },
                    correctAnswer,
                    type: 'Search',
                    text: `Pentru problema **${selectedProblem.name}** cu instanța:\n\n${instance.text}\n\nCare este cea mai potrivită strategie de rezolvare?`,
                    comparisonResults,
                    bestStrategy
                };

                db.logQuestion(selectedProblem.id, instance, correctAnswer);
                resolve(question);
            } else if (type === 'nash') {
                const nashProblem = db.getProblemTypeByName('Nash Equilibrium');
                const instance = generateNashInstance(difficultyConfig);
                const correctAnswer = determineNashEquilibrium(instance.matrix);

                const question = {
                    id: Date.now(),
                    problem: { ...nashProblem, instance },
                    correctAnswer,
                    type: 'GameTheory',
                    text: `Matrice de plăți (P1, P2) - ${instance.rows}x${instance.cols}:\n\n${instance.visual}\n\n**Găsiți Echilibrele Nash (pure)?**\n\n*Format răspuns: (rând, coloană) - ex: (1, 2) sau (2, 3); (1, 1) pentru mai multe echilibre*`
                };

                db.logQuestion(nashProblem.id, instance, correctAnswer);
                resolve(question);
            } else if (type === 'csp') {
                const instance = generateRandomCSPInstance(3, 5, difficultyConfig);
                const comparisonResults = runCSPComparison(
                    instance.variables,
                    instance.domains,
                    instance.constraints,
                    instance.partial
                );

                const optimizations = ['None', 'MRV (Minimum Remaining Values)', 'Forward Checking', 'AC-3'];

                // Filter to only available results and pick one
                const availableOptimizations = optimizations.filter(opt =>
                    comparisonResults.some(r => r.optimization === opt)
                );

                const selectedOpt = availableOptimizations.length > 0
                    ? availableOptimizations[Math.floor(Math.random() * availableOptimizations.length)]
                    : optimizations[0];

                let selectedResult = comparisonResults.find(r => r.optimization === selectedOpt);

                // Fallback to first result if selected optimization not found
                if (!selectedResult || !selectedResult.solution) {
                    selectedResult = comparisonResults[0] || {
                        solution: {},
                        nodesExplored: 0,
                        executionTime: 0,
                        found: false,
                        optimization: 'Unknown'
                    };
                }

                const remainingVars = instance.remainingVariables;
                const correctAnswer = selectedResult.solution || {};

                const correctText = Object.entries(correctAnswer)
                    .filter(([k]) => remainingVars.includes(k))
                    .map(([k, v]) => `${k}=${v}`)
                    .join(', ');

                // Format constraints for display and chat agent input
                const formatConstraint = (key, fn) => {
                    const [a, b] = key.split(',');
                    const body = fn.toString();
                    if (body.includes('!==')) return `${a}!=${b}`;
                    if (body.includes('a < b')) return `${a}<${b}`;
                    if (body.includes('a <= b')) return `${a}<=${b}`;
                    if (body.includes('Math.abs') && body.includes('>= 2')) return `|${a}-${b}|>=2`;
                    return `${a}?${b}`;
                };

                const constraintsText = Object.entries(instance.constraints)
                    .map(([k, fn]) => formatConstraint(k, fn))
                    .join(', ');

                // Store formatted constraints in instance for display
                instance.constraintsText = constraintsText;
                instance.constraintsFormatted = Object.entries(instance.constraints)
                    .map(([k, fn]) => ({ key: k, text: formatConstraint(k, fn) }));

                const question = {
                    id: Date.now(),
                    problem: { name: 'CSP (Constraint Satisfaction)', instance, description: instance.description },
                    correctAnswer: {
                        strategy: correctText || 'No solution found',
                        reason: `Using ${selectedResult.optimization}, the solver explored ${selectedResult.nodesExplored || 0} nodes in ${selectedResult.executionTime || 0}ms. ${selectedResult.found ? 'Solution found.' : 'No solution exists.'}`,
                        type: 'CSP',
                        rawSolution: correctAnswer
                    },
                    type: 'CSP',
                    text: `${instance.instanceText}\n\nConstraints: ${constraintsText}\n\n**Folosind optimizarea: ${selectedResult.optimization}**\n\nCare sunt valorile pentru: ${remainingVars.join(', ')}?`,
                    comparisonResults,
                    selectedOptimization: selectedResult.optimization,
                    remainingVariables: remainingVars
                };

                db.logQuestion(null, instance, question.correctAnswer);
                resolve(question);
            } else if (type === 'adversarial') {
                const instance = generateAdversarialInstance(difficultyConfig);
                const solution = solveMinimaxAlphaBeta(instance);

                // Format values array with '-' for internal nodes (non-leaves)
                const formattedValues = instance.values.map(v => v === null ? '-' : v);

                const question = {
                    id: Date.now(),
                    problem: {
                        name: 'Adversarial Search (Minimax + Alpha-Beta)',
                        description: 'Calculează valoarea rădăcinii și numărul de frunze vizitate folosind Minimax cu tăiere Alpha-Beta.',
                        instance
                    },
                    correctAnswer: {
                        rootValue: solution.rootValue,
                        visitedLeaves: solution.visitedLeaves,
                        totalLeaves: solution.totalLeaves,
                        type: 'Adversarial'
                    },
                    type: 'Adversarial',
                    text: `Arbore de joc cu ${instance.parents.length} noduri și ${instance.leafValues.length} frunze.\nVector tati: [${instance.parents.join(', ')}]\nValori noduri: [${formattedValues.join(', ')}]\n\nCalculați folosind Minimax cu Alpha-Beta Pruning:\n- Valoarea rădăcinii\n- Numărul de frunze vizitate\n\nFormat: "valoare, nr_frunze"`
                };

                db.logQuestion(null, instance, question.correctAnswer);
                resolve(question);
            }
        }, 800);
    });
};

/**
 * Template-Driven Question Generator
 * 
 * All questions are generated from database templates.
 * Instance generation uses database configuration.
 * NO hardcoded logic for question text or difficulty parameters.
 */

const {
    generateSearchInstance,
    generateNashInstance,
    generateRandomCSPInstance,
    generateAdversarialInstance
} = require('./instanceGenerators');

class TemplateQuestionGenerator {
    constructor(templateDbService, legacyDb = null) {
        this.templateDb = templateDbService;
        this.legacyDb = legacyDb; // For backward compatibility with existing DB methods
    }

    /**
     * Generate a complete question from template
     * @param {string} questionType - 'search', 'nash', 'csp', 'adversarial'
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     * @returns {Promise<Object>} Complete question object
     */
    async generateQuestion(questionType, difficulty = 'medium') {
        try {
            // Get template and config from database
            const template = await this.templateDb.getQuestionTemplate(questionType);
            const config = await this.templateDb.getDifficultyConfig(questionType, difficulty);

            if (!template) {
                throw new Error(`No template found for question type: ${questionType}`);
            }
            if (!config) {
                throw new Error(`No difficulty config found for: ${questionType}/${difficulty}`);
            }

            // Generate instance data based on question type
            const instanceData = await this.generateInstance(questionType, config);

            // Get evaluation rules for answer generation
            const evalRules = await this.templateDb.getEvaluationRules(questionType);

            // Generate correct answer based on instance
            const correctAnswer = await this.generateCorrectAnswer(
                questionType,
                instanceData,
                evalRules
            );

            // Create question from template with filled placeholders
            const question = await this.templateDb.generateQuestionFromTemplate(
                questionType,
                difficulty,
                instanceData
            );

            // Add correct answer and instance data
            return {
                ...question,
                instance: instanceData,
                correctAnswer,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    difficulty,
                    templateId: template.id,
                    configId: config.id
                }
            };
        } catch (error) {
            console.error('Error generating question from template:', error);
            throw error;
        }
    }

    /**
     * Generate instance data based on question type
     * Maps template config to instance generator function
     */
    async generateInstance(questionType, config) {
        switch (questionType) {
            case 'search':
                return this.generateSearchInstance(config);
            case 'nash':
                return this.generateNashInstance(config);
            case 'csp':
                return this.generateCSPInstance(config);
            case 'adversarial':
                return this.generateAdversarialInstance(config);
            default:
                throw new Error(`Unknown question type: ${questionType}`);
        }
    }

    /**
     * Generate search instance from database config
     */
    generateSearchInstance(config) {
        // Extract ranges from config
        const nodeCount = this.randomInRange(config.node_count);
        const edgeCount = this.randomInRange(config.edge_count);
        const branchingFactor = this.randomInRange(config.branching_factor);
        const estimatedDepth = this.randomInRange(config.estimated_depth);

        // Select problem name from configured options
        const problemName = config.problem_names[
            Math.floor(Math.random() * config.problem_names.length)
        ];

        return {
            problemName,
            nodeCount,
            edgeCount,
            startNode: 'S',
            goalNode: 'G',
            visualization: this.generateGraphVisualization(nodeCount, edgeCount),
            graphType: config.graph_type,
            branchingFactor,
            estimatedDepth,
            costType: config.cost_type,

            // These go into template placeholders
            'problemName': problemName,
            'nodeCount': nodeCount,
            'edgeCount': edgeCount,
            'startNode': 'S',
            'goalNode': 'G',
            'visualization': this.generateGraphVisualization(nodeCount, edgeCount),
            'graphType': config.graph_type,
            'branchingFactor': branchingFactor,
            'estimatedDepth': estimatedDepth,
            'costType': config.cost_type
        };
    }

    /**
     * Generate Nash game instance from database config
     */
    generateNashInstance(config) {
        const rows = this.randomInRange(config.matrix_rows);
        const cols = this.randomInRange(config.matrix_cols);
        const payoffRange = config.payoff_range;

        // Generate random payoff matrix
        const matrix = [];
        const matrixDisplay = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            const displayRow = [];
            for (let j = 0; j < cols; j++) {
                const p1 = Math.floor(Math.random() * (payoffRange.max - payoffRange.min + 1)) + payoffRange.min;
                const p2 = Math.floor(Math.random() * (payoffRange.max - payoffRange.min + 1)) + payoffRange.min;
                row.push([p1, p2]);
                displayRow.push(`(${p1}, ${p2})`);
            }
            matrix.push(row);
            matrixDisplay.push(displayRow);
        }

        // Find Nash equilibrium (simplified - real implementation more complex)
        const equilibria = this.findNashEquilibria(matrix);

        return {
            rows,
            cols,
            matrix,
            equilibria,
            'rows': rows,
            'cols': cols,
            'matrix': this.formatPayoffMatrix(matrixDisplay),
            'equilibria': equilibria.map(e => `(${e[0]}, ${e[1]})`).join(', ')
        };
    }

    /**
     * Generate CSP instance from database config
     */
    generateCSPInstance(config) {
        const varCount = this.randomInRange(config.variable_count);
        const domainSize = this.randomInRange(config.domain_size);
        const constraintCount = this.randomInRange(config.constraint_count);
        const optimization = config.optimizations[0]; // Use first suggested optimization

        // Generate variables
        const variables = [];
        const domains = {};
        const variablesList = [];
        for (let i = 1; i <= varCount; i++) {
            const varName = `x${i}`;
            variables.push(varName);
            domains[varName] = this.generateDomain(domainSize);
            variablesList.push(`${varName}: {${domains[varName].join(', ')}}`);
        }

        // Generate constraints
        const constraintTypes = config.constraint_types || ['inequality', 'difference'];
        const constraints = [];
        const constraintsList = [];
        for (let i = 0; i < constraintCount; i++) {
            const var1 = variables[Math.floor(Math.random() * variables.length)];
            const var2 = variables[Math.floor(Math.random() * variables.length)];
            if (var1 !== var2) {
                const type = constraintTypes[Math.floor(Math.random() * constraintTypes.length)];
                const constraint = this.generateConstraint(var1, var2, type);
                constraints.push(constraint);
                constraintsList.push(this.formatConstraintForDisplay(constraint));
            }
        }

        return {
            varCount,
            domainSize,
            variables,
            domains,
            constraints,
            optimization,
            'variablesList': variablesList.join('\n'),
            'constraintsList': constraintsList.join('\n'),
            'optimization': optimization,
            'optimizationDescription': this.getOptimizationDescription(optimization)
        };
    }

    /**
     * Generate adversarial search instance from database config
     */
    generateAdversarialInstance(config) {
        const maxDepth = config.max_depth;
        const branchingFactor = this.randomInRange(config.branching_factor);
        const leafCount = Math.pow(branchingFactor, maxDepth);

        // Generate game tree with leaf values
        const leafValues = [];
        for (let i = 0; i < leafCount; i++) {
            leafValues.push(Math.floor(Math.random() * 20) - 10);
        }

        // Calculate minimax value
        const minimaxValue = this.calculateMinimaxValue(leafValues, maxDepth, branchingFactor);

        return {
            maxDepth,
            branchingFactor,
            leafCount,
            leafValues,
            minimaxValue,
            algorithm: config.algorithm || 'Minimax',
            'maxDepth': maxDepth,
            'branchingFactor': branchingFactor,
            'leafCount': leafCount,
            'leafValues': leafValues.map((v, i) => `Leaf ${i + 1}: ${v}`).join('\n'),
            'treeStructure': this.generateTreeStructureDisplay(maxDepth, branchingFactor),
            'algorithm': config.algorithm || 'Minimax'
        };
    }

    /**
     * Generate correct answer based on instance and question type
     */
    async generateCorrectAnswer(questionType, instanceData, evalRules) {
        switch (questionType) {
            case 'search':
                // Best strategy depends on graph properties
                return this.determineBestSearchStrategy(instanceData);

            case 'nash':
                // Nash equilibrium from computed equilibria
                return {
                    type: 'equilibrium_pair',
                    rawSolution: instanceData.equilibria,
                    formatted: instanceData.equilibria
                };

            case 'csp':
                // Solve CSP to get correct assignment
                const solution = await this.solveCSP(instanceData);
                return {
                    type: 'assignment_set',
                    rawSolution: solution,
                    formatted: this.formatCSPSolution(solution)
                };

            case 'adversarial':
                // Minimax value and leaf count
                return {
                    type: 'numeric_pair',
                    rootValue: instanceData.minimaxValue,
                    leafCount: instanceData.leafCount,
                    rawSolution: `${instanceData.minimaxValue} ${instanceData.leafCount}`,
                    formatted: `Root value: ${instanceData.minimaxValue}, Leaves evaluated: ${instanceData.leafCount}`
                };

            default:
                throw new Error(`Unknown question type: ${questionType}`);
        }
    }

    /**
     * Helper: Random value in range
     */
    randomInRange(range) {
        if (typeof range === 'number') {
            return range;
        }
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    /**
     * Helper: Generate domain for CSP variable
     */
    generateDomain(size) {
        const domain = [];
        for (let i = 1; i <= size; i++) {
            domain.push(i);
        }
        return domain;
    }

    /**
     * Helper: Generate constraint between two variables
     */
    generateConstraint(var1, var2, type) {
        switch (type) {
            case 'inequality':
                return { var1, var2, operator: '!=', type };
            case 'difference':
                const diff = Math.floor(Math.random() * 3) + 1;
                return { var1, var2, operator: '>=', value: diff, type };
            case 'less_than':
                return { var1, var2, operator: '<', type };
            case 'greater_than':
                return { var1, var2, operator: '>', type };
            default:
                return { var1, var2, operator: '!=', type: 'inequality' };
        }
    }

    /**
     * Helper: Format constraint for display
     */
    formatConstraintForDisplay(constraint) {
        if (constraint.value !== undefined) {
            return `|${constraint.var1} - ${constraint.var2}| ${constraint.operator} ${constraint.value}`;
        }
        return `${constraint.var1} ${constraint.operator} ${constraint.var2}`;
    }

    /**
     * Helper: Get optimization method description
     */
    getOptimizationDescription(optimization) {
        const descriptions = {
            'AC-3': 'Maintains Arc Consistency before each assignment',
            'MRV': 'Selects variable with Minimum Remaining Values',
            'Forward Checking': 'Checks forward to detect failures early',
            'LCV': 'Orders values by Least Constraining Variable heuristic'
        };
        return descriptions[optimization] || optimization;
    }

    /**
     * Helper: Determine best search strategy
     */
    determineBestSearchStrategy(instanceData) {
        // Strategy selection based on graph properties
        if (instanceData.estimatedDepth > 5) {
            return 'A*';
        } else if (instanceData.branchingFactor > 2) {
            return 'DFS';
        } else {
            return 'BFS';
        }
    }

    /**
     * Helper: Find Nash equilibria
     */
    findNashEquilibria(matrix) {
        // Simplified Nash equilibrium finding
        // Real implementation would use proper game theory algorithms
        const equilibria = [];
        const rows = matrix.length;
        const cols = matrix[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Check if (i, j) is Nash equilibrium
                if (this.isNashEquilibrium(matrix, i, j)) {
                    equilibria.push([i + 1, j + 1]); // 1-based indexing
                }
            }
        }

        return equilibria.length > 0 ? equilibria : [[1, 1]]; // Default fallback
    }

    /**
     * Helper: Check if position is Nash equilibrium
     */
    isNashEquilibrium(matrix, row, col) {
        const [p1, p2] = matrix[row][col];

        // Check row (player 1 can't improve)
        for (let j = 0; j < matrix[row].length; j++) {
            if (matrix[row][j][0] > p1) return false;
        }

        // Check column (player 2 can't improve)
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][col][1] > p2) return false;
        }

        return true;
    }

    /**
     * Helper: Solve CSP
     */
    async solveCSP(instanceData) {
        // This would use the CSP solver from algorithmSolvers.js
        // For now, return a simple solution
        const solution = {};
        instanceData.variables.forEach((v, i) => {
            solution[v] = instanceData.domains[v][0];
        });
        return solution;
    }

    /**
     * Helper: Format CSP solution
     */
    formatCSPSolution(solution) {
        return Object.entries(solution)
            .sort()
            .map(([var_, val]) => `${var_}=${val}`)
            .join(', ');
    }

    /**
     * Helper: Generate graph visualization
     */
    generateGraphVisualization(nodeCount, edgeCount) {
        return `
Nodes: 1, 2, 3, ..., ${nodeCount}
Edges: ${edgeCount} connections
Start: Node 1
Goal: Node ${nodeCount}
    `;
    }

    /**
     * Helper: Format payoff matrix display
     */
    formatPayoffMatrix(matrixDisplay) {
        return matrixDisplay.map(row => row.join(' ')).join('\n');
    }

    /**
     * Helper: Generate tree structure
     */
    generateTreeStructureDisplay(maxDepth, branchingFactor) {
        return `Game tree with depth ${maxDepth} and branching factor ${branchingFactor}`;
    }

    /**
     * Helper: Calculate minimax value
     */
    calculateMinimaxValue(leafValues, maxDepth, branchingFactor) {
        if (maxDepth === 0) return leafValues[0];
        // Simplified - real implementation would build full tree
        return Math.max(...leafValues);
    }
}

module.exports = TemplateQuestionGenerator;

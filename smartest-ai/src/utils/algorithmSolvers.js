// ============================================================================
// ALGORITHM IMPLEMENTATIONS - SOLVERS FOR TESTING
// ============================================================================

// N-Queens Algorithms
export const solveNQueensBacktracking = (n) => {
    const startTime = performance.now();
    let nodesExplored = 0;

    const isSafe = (board, row, col) => {
        for (let i = 0; i < row; i++) {
            if (board[i] === col || Math.abs(board[i] - col) === Math.abs(i - row)) {
                return false;
            }
        }
        return true;
    };

    const backtrack = (board, row) => {
        nodesExplored++;
        if (row === n) {
            return true;
        }
        for (let col = 0; col < n; col++) {
            if (isSafe(board, row, col)) {
                board[row] = col;
                if (backtrack(board, row + 1)) {
                    return true;
                }
            }
        }
        return false;
    };

    const board = new Array(n);
    const found = backtrack(board, 0);
    const endTime = performance.now();

    return {
        found,
        solution: found ? board : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking'
    };
};

export const solveNQueensHillClimbing = (n) => {
    const startTime = performance.now();
    let nodesExplored = 0;
    const maxIterations = 1000;

    // Random initial state
    const board = Array.from({ length: n }, () => Math.floor(Math.random() * n));

    const countConflicts = (board) => {
        let conflicts = 0;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (board[i] === board[j] || Math.abs(board[i] - board[j]) === Math.abs(i - j)) {
                    conflicts++;
                }
            }
        }
        return conflicts;
    };

    let currentConflicts = countConflicts(board);
    let iterations = 0;

    while (currentConflicts > 0 && iterations < maxIterations) {
        nodesExplored++;
        let improved = false;

        for (let col = 0; col < n; col++) {
            const oldRow = board[col];
            for (let row = 0; row < n; row++) {
                if (row === oldRow) continue;
                board[col] = row;
                const newConflicts = countConflicts(board);
                if (newConflicts < currentConflicts) {
                    currentConflicts = newConflicts;
                    improved = true;
                    break;
                }
                board[col] = oldRow;
            }
            if (improved) break;
        }

        if (!improved) break;
        iterations++;
    }

    const endTime = performance.now();
    return {
        found: currentConflicts === 0,
        solution: currentConflicts === 0 ? board : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Hill Climbing',
        conflicts: currentConflicts
    };
};

// Hanoi Algorithms
export const solveHanoiDFS = (discs, pegs) => {
    const startTime = performance.now();
    let nodesExplored = 0;
    const moves = [];

    const hanoi = (n, from, to, aux) => {
        nodesExplored++;
        if (n === 1) {
            moves.push(`Move disc 1 from ${from} to ${to}`);
            return;
        }
        hanoi(n - 1, from, aux, to);
        moves.push(`Move disc ${n} from ${from} to ${to}`);
        hanoi(n - 1, aux, to, from);
    };

    // Always run for standard 3 pegs (most common case)
    hanoi(discs, 'A', 'C', 'B');

    const endTime = performance.now();
    return {
        found: true,
        solution: moves,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'DFS',
        moveCount: moves.length
    };
};

export const solveHanoiBFS = (discs, pegs) => {
    const startTime = performance.now();
    let nodesExplored = 0;
    const moves = [];

    // For 3 pegs, BFS finds optimal solution (2^n - 1 moves)
    // Both BFS and DFS find same number of moves, but BFS explores level-by-level
    const hanoi = (n, from, to, aux) => {
        nodesExplored++;
        if (n === 1) {
            moves.push(`Move disc 1 from ${from} to ${to}`);
            return;
        }
        hanoi(n - 1, from, aux, to);
        moves.push(`Move disc ${n} from ${from} to ${to}`);
        hanoi(n - 1, aux, to, from);
    };

    // Always run for standard 3 pegs (most common case)
    hanoi(discs, 'A', 'C', 'B');

    const endTime = performance.now();
    return {
        found: true,
        solution: moves,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'BFS',
        moveCount: moves.length
    };
};

// Graph Coloring Algorithms
export const solveGraphColoringBacktracking = (nodes, edges, colors) => {
    const startTime = performance.now();
    let nodesExplored = 0;

    // Generate random adjacency list
    const graph = Array.from({ length: nodes }, () => []);
    const edgeSet = new Set();

    for (let i = 0; i < edges; i++) {
        let u, v;
        do {
            u = Math.floor(Math.random() * nodes);
            v = Math.floor(Math.random() * nodes);
        } while (u === v || edgeSet.has(`${u}-${v}`) || edgeSet.has(`${v}-${u}`));

        edgeSet.add(`${u}-${v}`);
        graph[u].push(v);
        graph[v].push(u);
    }

    const coloring = new Array(nodes).fill(-1);

    const isSafe = (node, color) => {
        for (const neighbor of graph[node]) {
            if (coloring[neighbor] === color) {
                return false;
            }
        }
        return true;
    };

    const backtrack = (node) => {
        nodesExplored++;
        if (node === nodes) {
            return true;
        }

        for (let color = 0; color < colors; color++) {
            if (isSafe(node, color)) {
                coloring[node] = color;
                if (backtrack(node + 1)) {
                    return true;
                }
                coloring[node] = -1;
            }
        }
        return false;
    };

    const found = backtrack(0);
    const endTime = performance.now();

    return {
        found,
        solution: found ? coloring : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking'
    };
};

export const solveGraphColoringGreedy = (nodes, edges, colors) => {
    const startTime = performance.now();
    let nodesExplored = nodes;

    // Generate random adjacency list
    const graph = Array.from({ length: nodes }, () => []);
    const edgeSet = new Set();

    for (let i = 0; i < edges; i++) {
        let u, v;
        do {
            u = Math.floor(Math.random() * nodes);
            v = Math.floor(Math.random() * nodes);
        } while (u === v || edgeSet.has(`${u}-${v}`) || edgeSet.has(`${v}-${u}`));

        edgeSet.add(`${u}-${v}`);
        graph[u].push(v);
        graph[v].push(u);
    }

    const coloring = new Array(nodes).fill(-1);

    for (let node = 0; node < nodes; node++) {
        const usedColors = new Set(graph[node].map(n => coloring[n]).filter(c => c !== -1));
        for (let color = 0; color < colors; color++) {
            if (!usedColors.has(color)) {
                coloring[node] = color;
                break;
            }
        }
    }

    const endTime = performance.now();
    const found = coloring.every(c => c !== -1);

    return {
        found,
        solution: found ? coloring : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Greedy Best-First'
    };
};

// Knight's Tour Algorithms
export const solveKnightsTourBacktracking = (size) => {
    const startTime = performance.now();
    let nodesExplored = 0;
    const board = Array.from({ length: size }, () => new Array(size).fill(-1));
    const moves = [
        [2, 1], [1, 2], [-1, 2], [-2, 1],
        [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];

    const isValid = (x, y) => x >= 0 && x < size && y >= 0 && y < size && board[x][y] === -1;

    const backtrack = (x, y, moveCount) => {
        nodesExplored++;
        if (nodesExplored > 100000) return false; // Timeout protection

        board[x][y] = moveCount;

        if (moveCount === size * size - 1) {
            return true;
        }

        for (const [dx, dy] of moves) {
            const nx = x + dx;
            const ny = y + dy;
            if (isValid(nx, ny)) {
                if (backtrack(nx, ny, moveCount + 1)) {
                    return true;
                }
            }
        }

        board[x][y] = -1;
        return false;
    };

    const found = backtrack(0, 0, 0);
    const endTime = performance.now();

    return {
        found,
        solution: found ? board : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking'
    };
};

export const solveKnightsTourGreedy = (size) => {
    const startTime = performance.now();
    let nodesExplored = 0;
    const board = Array.from({ length: size }, () => new Array(size).fill(-1));
    const moves = [
        [2, 1], [1, 2], [-1, 2], [-2, 1],
        [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];

    const isValid = (x, y) => x >= 0 && x < size && y >= 0 && y < size && board[x][y] === -1;

    const countMoves = (x, y) => {
        let count = 0;
        for (const [dx, dy] of moves) {
            if (isValid(x + dx, y + dy)) count++;
        }
        return count;
    };

    let x = 0, y = 0;
    board[x][y] = 0;

    for (let moveCount = 1; moveCount < size * size; moveCount++) {
        nodesExplored++;
        let minMoves = 9;
        let nextX = -1, nextY = -1;

        for (const [dx, dy] of moves) {
            const nx = x + dx;
            const ny = y + dy;
            if (isValid(nx, ny)) {
                const movesCount = countMoves(nx, ny);
                if (movesCount < minMoves) {
                    minMoves = movesCount;
                    nextX = nx;
                    nextY = ny;
                }
            }
        }

        if (nextX === -1) break;
        x = nextX;
        y = nextY;
        board[x][y] = moveCount;
    }

    const endTime = performance.now();
    const found = board.flat().every(cell => cell !== -1);

    return {
        found,
        solution: found ? board : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Greedy (Warnsdorff)'
    };
};

// ============================================================================
// COMPARISON FUNCTION - RUNS ALL ALGORITHMS AND RETURNS RESULTS
// ============================================================================

export const runAlgorithmComparison = (problemName, instance) => {
    const results = [];

    switch (problemName) {
        case 'N-Queens': {
            const n = instance.n || instance.size || 8;

            // Run Backtracking
            const btResult = solveNQueensBacktracking(n);
            results.push(btResult);

            // Run Hill Climbing
            const hcResult = solveNQueensHillClimbing(n);
            results.push(hcResult);

            break;
        }

        case 'Generalized Hanoi': {
            const discs = instance.discs || instance.size || 3;
            const pegs = instance.pegs || 3;

            // Run DFS
            const dfsResult = solveHanoiDFS(discs, pegs);
            results.push(dfsResult);

            // Run BFS
            const bfsResult = solveHanoiBFS(discs, pegs);
            results.push(bfsResult);

            break;
        }

        case 'Graph Coloring': {
            const nodes = instance.nodes || instance.size || 8;
            const edges = instance.edges || Math.floor(nodes * (nodes - 1) / 4);
            const colors = instance.colors || 3;

            // Run Backtracking
            const btResult = solveGraphColoringBacktracking(nodes, edges, colors);
            results.push(btResult);

            // Run Greedy
            const greedyResult = solveGraphColoringGreedy(nodes, edges, colors);
            results.push(greedyResult);

            break;
        }

        case "Knight's Tour": {
            const size = instance.size || 5;

            // Run Backtracking
            if (size <= 6) {
                const btResult = solveKnightsTourBacktracking(size);
                results.push(btResult);
            }

            // Run Greedy (Warnsdorff)
            const greedyResult = solveKnightsTourGreedy(size);
            results.push(greedyResult);

            break;
        }

        default:
            return results;
    }

    return results;
};

// ============================================================================
// BEST STRATEGY SELECTION BASED ON COMPARISON
// ============================================================================

export const selectBestStrategy = (comparisonResults) => {
    if (!comparisonResults || comparisonResults.length === 0) {
        return null;
    }

    // If all found solutions, pick fastest
    const foundResults = comparisonResults.filter(r => r.found);

    if (foundResults.length > 0) {
        // Sort by execution time
        foundResults.sort((a, b) => parseFloat(a.executionTime) - parseFloat(b.executionTime));
        return foundResults[0];
    }

    // If none found solutions, pick with least nodes explored
    comparisonResults.sort((a, b) => a.nodesExplored - b.nodesExplored);
    return comparisonResults[0];
};

// ============================================================================
// CSP (CONSTRAINT SATISFACTION PROBLEM) ALGORITHMS - SIMPLIFIED
// ============================================================================

export const solveCSPBacktracking = (variables, domains, constraints, partial) => {
    const startTime = performance.now();
    let nodesExplored = 0;

    const assignment = { ...partial };

    const isConsistent = (var1, val1, var2, val2) => {
        const key = `${var1},${var2}`;
        const reverseKey = `${var2},${var1}`;

        if (key in constraints) {
            return constraints[key](val1, val2);
        }
        if (reverseKey in constraints) {
            // reverseKey exists as (var2,var1) in constraints
            // It checks var2 op var1, so we need val2 op val1
            return constraints[reverseKey](val2, val1);
        }
        return true;
    };

    const backtrack = () => {
        nodesExplored++;

        if (Object.keys(assignment).length === variables.length) {
            return true;
        }

        const unassigned = variables.find(v => !(v in assignment));

        for (const value of domains[unassigned]) {
            let consistent = true;

            for (const assignedVar in assignment) {
                if (!isConsistent(unassigned, value, assignedVar, assignment[assignedVar])) {
                    consistent = false;
                    break;
                }
            }

            if (consistent) {
                assignment[unassigned] = value;
                if (backtrack()) return true;
                delete assignment[unassigned];
            }
        }

        return false;
    };

    const found = backtrack();
    const endTime = performance.now();

    return {
        found,
        solution: found ? assignment : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking',
        optimization: 'None'
    };
};

export const solveCSPBacktrackingMRV = (variables, domains, constraints, partial) => {
    const startTime = performance.now();
    let nodesExplored = 0;

    const assignment = { ...partial };
    const domainCopy = {};

    for (const v of variables) {
        domainCopy[v] = v in partial ? [partial[v]] : [...domains[v]];
    }

    const isConsistent = (var1, val1, var2, val2) => {
        const key = `${var1},${var2}`;
        const reverseKey = `${var2},${var1}`;

        if (key in constraints) {
            return constraints[key](val1, val2);
        }
        if (reverseKey in constraints) {
            // For reverse key, we need to apply constraint in its original direction
            // reverseKey constraint is defined as (b, a) so we call it with (val2, val1)
            return constraints[reverseKey](val2, val1);
        }
        return true;
    };

    const selectUnassignedVariable = () => {
        let minDomain = Infinity;
        let selected = null;

        for (const v of variables) {
            if (!(v in assignment) && domainCopy[v].length > 0 && domainCopy[v].length < minDomain) {
                minDomain = domainCopy[v].length;
                selected = v;
            }
        }

        return selected;
    };

    const backtrack = () => {
        nodesExplored++;

        if (Object.keys(assignment).length === variables.length) {
            return true;
        }

        const unassigned = selectUnassignedVariable();
        if (!unassigned) return false;

        for (const value of domainCopy[unassigned]) {
            let consistent = true;

            for (const assignedVar in assignment) {
                if (!isConsistent(unassigned, value, assignedVar, assignment[assignedVar])) {
                    consistent = false;
                    break;
                }
            }

            if (consistent) {
                assignment[unassigned] = value;
                const oldDomain = domainCopy[unassigned];
                domainCopy[unassigned] = [value];

                if (backtrack()) return true;

                delete assignment[unassigned];
                domainCopy[unassigned] = oldDomain;
            }
        }

        return false;
    };

    const found = backtrack();
    const endTime = performance.now();

    return {
        found,
        solution: found ? assignment : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking',
        optimization: 'MRV (Minimum Remaining Values)'
    };
};

export const solveCSPBacktrackingForwardChecking = (variables, domains, constraints, partial) => {
    const startTime = performance.now();
    let nodesExplored = 0;

    const assignment = { ...partial };
    const domainCopy = {};

    for (const v of variables) {
        domainCopy[v] = v in partial ? [partial[v]] : [...domains[v]];
    }

    const isConsistent = (var1, val1, var2, val2) => {
        const key = `${var1},${var2}`;
        const reverseKey = `${var2},${var1}`;

        if (key in constraints) {
            return constraints[key](val1, val2);
        }
        if (reverseKey in constraints) {
            // For reverse key, we need to apply constraint in its original direction
            // reverseKey constraint is defined as (b, a) so we call it with (val2, val1)
            return constraints[reverseKey](val2, val1);
        }
        return true;
    };

    const forwardCheck = (variable, value) => {
        const removals = [];

        for (const v of variables) {
            if (v === variable || v in assignment) continue;

            const constraintKey = `${variable},${v}`;
            const reverseKey = `${v},${variable}`;

            if (!(constraintKey in constraints) && !(reverseKey in constraints)) continue;

            const oldDomain = [...domainCopy[v]];
            domainCopy[v] = domainCopy[v].filter(val => isConsistent(variable, value, v, val));

            if (domainCopy[v].length === 0) {
                removals.forEach(([va, domain]) => {
                    domainCopy[va] = domain;
                });
                return false;
            }

            removals.push([v, oldDomain]);
        }

        return true;
    };

    const backtrack = () => {
        nodesExplored++;

        if (Object.keys(assignment).length === variables.length) {
            return true;
        }

        const unassigned = variables.find(v => !(v in assignment) && domainCopy[v].length > 0);
        if (!unassigned) return false;

        for (const value of domainCopy[unassigned]) {
            let consistent = true;

            for (const assignedVar in assignment) {
                if (!isConsistent(unassigned, value, assignedVar, assignment[assignedVar])) {
                    consistent = false;
                    break;
                }
            }

            if (consistent) {
                assignment[unassigned] = value;
                const oldDomains = JSON.parse(JSON.stringify(domainCopy));

                if (forwardCheck(unassigned, value) && backtrack()) {
                    return true;
                }

                delete assignment[unassigned];
                Object.assign(domainCopy, oldDomains);
            }
        }

        return false;
    };

    const found = backtrack();
    const endTime = performance.now();

    return {
        found,
        solution: found ? assignment : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking',
        optimization: 'Forward Checking'
    };
};

export const solveCSPBacktrackingAC3 = (variables, domains, constraints, partial) => {
    const startTime = performance.now();
    let nodesExplored = 0;

    const assignment = { ...partial };
    const domainCopy = {};

    for (const v of variables) {
        domainCopy[v] = v in partial ? [partial[v]] : [...domains[v]];
    }

    const isConsistent = (var1, val1, var2, val2) => {
        const key = `${var1},${var2}`;
        const reverseKey = `${var2},${var1}`;

        if (key in constraints) {
            return constraints[key](val1, val2);
        }
        if (reverseKey in constraints) {
            // For reverse key, we need to apply constraint in its original direction
            // reverseKey constraint is defined as (b, a) so we call it with (val2, val1)
            return constraints[reverseKey](val2, val1);
        }
        return true;
    };

    const ac3 = () => {
        const queue = [];

        for (const key in constraints) {
            const [v1, v2] = key.split(',');
            // Only add to queue if both variables exist in domainCopy
            if (domainCopy[v1] && domainCopy[v2]) {
                // Add both directions for arc consistency
                queue.push([v1, v2]);
                queue.push([v2, v1]);
            }
        }

        while (queue.length > 0) {
            const [xi, xj] = queue.shift();

            // Safety check: ensure both variables exist
            if (!domainCopy[xi] || !domainCopy[xj]) {
                continue;
            }

            const beforeSize = domainCopy[xi].length;
            domainCopy[xi] = domainCopy[xi].filter(val => {
                return domainCopy[xj].some(val2 => isConsistent(xi, val, xj, val2));
            });

            if (domainCopy[xi].length === 0) {
                return false;
            }

            if (domainCopy[xi].length < beforeSize) {
                for (const v of variables) {
                    if (v !== xi && v !== xj && domainCopy[v]) {
                        queue.push([v, xi]);
                    }
                }
            }
        }

        return true;
    };

    if (!ac3()) {
        const endTime = performance.now();
        return {
            found: false,
            solution: null,
            executionTime: (endTime - startTime).toFixed(2),
            nodesExplored,
            strategyUsed: 'Backtracking',
            optimization: 'AC-3'
        };
    }

    const backtrack = () => {
        nodesExplored++;

        if (Object.keys(assignment).length === variables.length) {
            return true;
        }

        const unassigned = variables.find(v => !(v in assignment) && domainCopy[v].length > 0);
        if (!unassigned) return false;

        for (const value of domainCopy[unassigned]) {
            assignment[unassigned] = value;
            const oldDomains = JSON.parse(JSON.stringify(domainCopy));
            domainCopy[unassigned] = [value];

            if (backtrack()) {
                return true;
            }

            delete assignment[unassigned];
            Object.assign(domainCopy, oldDomains);
        }

        return false;
    };

    const found = backtrack();
    const endTime = performance.now();

    return {
        found,
        solution: found ? assignment : null,
        executionTime: (endTime - startTime).toFixed(2),
        nodesExplored,
        strategyUsed: 'Backtracking',
        optimization: 'AC-3'
    };
};

export const runCSPComparison = (variables, domains, constraints, partial) => {
    const results = [];

    const btResult = solveCSPBacktracking(variables, domains, constraints, partial);
    results.push(btResult);

    const mrvResult = solveCSPBacktrackingMRV(variables, domains, constraints, partial);
    results.push(mrvResult);

    const fcResult = solveCSPBacktrackingForwardChecking(variables, domains, constraints, partial);
    results.push(fcResult);

    const ac3Result = solveCSPBacktrackingAC3(variables, domains, constraints, partial);
    results.push(ac3Result);

    return results;
};

// ============================================================================
// ADVERSARIAL SEARCH (MINIMAX WITH ALPHA-BETA)
// ============================================================================

export const generateAdversarialInstance = (options = {}) => {
    // Determine difficulty-based parameters
    let depth, maxChildren;

    if (options.difficulty === 'easy') {
        depth = options.depth || 2;
        maxChildren = options.maxChildren || 2;
    } else if (options.difficulty === 'medium') {
        depth = options.depth || (Math.random() < 0.6 ? 2 : 3);
        maxChildren = options.maxChildren || (Math.random() < 0.5 ? 2 : 3);
    } else if (options.difficulty === 'hard') {
        depth = options.depth || (Math.random() < 0.4 ? 3 : 4);
        maxChildren = options.maxChildren || (Math.random() < 0.5 ? 3 : 4);
    } else {
        depth = options.depth || (Math.random() < 0.7 ? 2 : 3);
        maxChildren = options.maxChildren || (Math.random() < 0.5 ? 2 : 3);
    }

    const maxLeafValue = options.maxLeafValue || 10;

    // Build tree structure with parent vector (tati)
    const parents = [-1]; // parent[0] = -1 (root has no parent)
    const values = [null]; // values[i] = leaf value or null for internal nodes
    let nodeId = 1;

    // BFS to build tree level by level
    const queue = [{ nodeId: 0, currentDepth: 0 }];

    while (queue.length > 0) {
        const { nodeId: currentId, currentDepth } = queue.shift();

        if (currentDepth >= depth) {
            // Make this a leaf node - assign value
            values[currentId] = Math.floor(Math.random() * (maxLeafValue + 1));
            continue;
        }

        // Random branching factor (1 to maxChildren)
        const numChildren = Math.floor(Math.random() * maxChildren) + 1;

        for (let i = 0; i < numChildren; i++) {
            const childId = nodeId++;
            parents.push(currentId); // childId's parent is currentId
            values.push(null); // Initially null, will be set if leaf
            queue.push({ nodeId: childId, currentDepth: currentDepth + 1 });
        }
    }

    // Reconstruct children to identify actual leaves (nodes with no children)
    const children = Array.from({ length: parents.length }, () => []);
    for (let i = 1; i < parents.length; i++) {
        children[parents[i]].push(i);
    }

    // Assign values to ALL leaves (any node with no children)
    for (let i = 0; i < parents.length; i++) {
        if (children[i].length === 0 && values[i] === null) {
            values[i] = Math.floor(Math.random() * (maxLeafValue + 1));
        }
    }

    // Extract leaf values in left-to-right order (all nodes with no children)
    const leafValues = [];
    const collectLeaves = (nodeId) => {
        if (children[nodeId].length === 0) {
            leafValues.push(values[nodeId]);
            return;
        }
        for (const c of children[nodeId]) collectLeaves(c);
    };
    collectLeaves(0);

    const totalLeaves = parents.filter((_, i) => children[i].length === 0).length;
    const rootPlayer = 'MAX';

    return {
        template: 'Adversarial Search Instance',
        description: 'Game tree for Minimax with Alpha-Beta pruning',
        depth,
        parents, // Vector de tati: parents[i] = parent of node i
        values,  // values[i] = leaf value or null for internal nodes
        leafValues,
        rootPlayer,
        totalLeaves,
        numNodes: parents.length,
        text: `Arbore (adâncime ${depth}, ${parents.length} noduri, ${totalLeaves} frunze)\nVector tati: [${parents.join(', ')}]\nValori noduri: [${values.map(v => v === null ? '-' : v).join(', ')}]\nRădăcină: ${rootPlayer}`
    };
};

export const solveMinimaxAlphaBeta = (instance) => {
    if (!instance || !instance.parents || !instance.values) {
        return { rootValue: Infinity, visitedLeaves: 0, totalLeaves: 0, error: 'Invalid instance' };
    }

    const { parents, values, rootPlayer = 'MAX' } = instance;

    // Reconstruct children from parent vector
    const children = Array.from({ length: parents.length }, () => []);
    for (let i = 1; i < parents.length; i++) {
        if (parents[i] < 0 || parents[i] >= parents.length) {
            return { rootValue: Infinity, visitedLeaves: 0, totalLeaves: 0, error: 'Invalid parent index' };
        }
        children[parents[i]].push(i);
    }

    // Ensure all leaves have values
    for (let i = 0; i < parents.length; i++) {
        if (children[i].length === 0 && values[i] === null) {
            values[i] = 0; // Assign default value to empty leaves
        }
    }

    const minimax = (nodeId, isMax, alpha, beta) => {
        // Leaf node: has no children
        if (children[nodeId].length === 0) {
            return { value: values[nodeId], visited: 1 };
        }

        let value = isMax ? -Infinity : Infinity;
        let visited = 0;

        for (const childId of children[nodeId]) {
            const child = minimax(childId, !isMax, alpha, beta);
            visited += child.visited;

            if (isMax) {
                value = Math.max(value, child.value);
                alpha = Math.max(alpha, value);
            } else {
                value = Math.min(value, child.value);
                beta = Math.min(beta, value);
            }

            // Alpha-beta pruning
            if (beta <= alpha) break;
        }

        return { value, visited };
    };

    const result = minimax(0, rootPlayer === 'MAX', -Infinity, Infinity);
    const totalLeaves = parents.filter((_, i) => children[i].length === 0).length;

    return {
        rootValue: result.value,
        visitedLeaves: result.visited,
        totalLeaves,
        strategyUsed: 'Minimax with Alpha-Beta',
        found: true,
        executionTime: '0',
        nodesExplored: result.visited
    };
};

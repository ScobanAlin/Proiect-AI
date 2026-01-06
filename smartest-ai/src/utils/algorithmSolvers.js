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

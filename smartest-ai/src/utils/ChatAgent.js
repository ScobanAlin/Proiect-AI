import { db } from '../services/database';
import { parseQuestionFromText } from './questionParser';
import { determineOptimalSearchStrategy, determineNashEquilibrium } from './strategyDeterminer';
import { parseCSPQuestion } from './cspSolver';
import { runCSPComparison, generateAdversarialInstance, solveMinimaxAlphaBeta } from './algorithmSolvers';
import { generateRandomCSPInstance } from './cspGenerator';

// Helper function to format constraint for display
const formatConstraint = (key, fn) => {
    const [a, b] = key.split(',');
    const body = fn.toString();
    if (body.includes('!==')) return `${a} != ${b}`;
    if (body.includes('a <= b')) return `${a} <= ${b}`;
    if (body.includes('a < b')) return `${a} < ${b}`;
    if (body.includes('a >= b')) return `${a} >= ${b}`;
    if (body.includes('a > b')) return `${a} > ${b}`;
    if (body.includes('Math.abs') && body.includes('>= 2')) return `|${a}-${b}| >= 2`;
    if (body.includes('Math.abs') && body.includes('<= ')) return `|${a}-${b}| <= value`;
    if (body.includes('Math.abs') && body.includes('> ')) return `|${a}-${b}| > value`;
    if (body.includes('Math.abs') && body.includes('< ')) return `|${a}-${b}| < value`;
    return `${a} ? ${b}`;
};

export const generateChatResponse = (question) => {
    const lowerText = question.toLowerCase();

    // Adversarial search (Minimax + Alpha-Beta)
    if (lowerText.includes('minimax') || lowerText.includes('alpha-beta') || lowerText.includes('αβ') || lowerText.includes('adversarial') || lowerText.includes('tree') || lowerText.includes('arbore')) {
        // Try to parse user-provided tree
        const parsedTree = parseAdversarialTree(question);

        const instance = parsedTree || generateAdversarialInstance();
        const result = solveMinimaxAlphaBeta(instance);

        // Format tree structure for display
        const treeDisplay = formatTreeStructure(instance);

        return `**Adversarial Search (Minimax + Alpha-Beta)** ✅\n\n` +
            `**Reprezentare Arbore:**\n` +
            `Vector tati (parent): [${instance.parents.join(', ')}]\n` +
            `Valori noduri: [${instance.values.map(v => v === null ? '-' : v).join(', ')}]\n\n` +
            `${treeDisplay}\n\n` +
            `Rădăcină: ${instance.rootPlayer}\n` +
            `Adâncime: ${instance.depth}, Noduri: ${instance.numNodes}, Frunze: ${instance.totalLeaves}\n` +
            `Valori frunze (stânga→dreapta): [${instance.leafValues.join(', ')}]\n\n` +
            `**Rezultat:**\n` +
            `• Valoare rădăcină: **${result.rootValue}**\n` +
            `• Frunze vizitate: **${result.visitedLeaves}** / ${result.totalLeaves}\n` +
            `• Optimizare: Alpha-Beta pruning\n\n` +
            `📚 **Referință:** [Minimax & Alpha-Beta - Slides](https://docs.google.com/presentation/d/1GeeTHsPKhCAlejgrrthnLVHIw-1gSBo5coW75vqh2lk/edit?slide=id.gfacdcaa922_0_0#slide=id.gfacdcaa922_0_0)`;
    }

    // Check for CSP question - try parsing first
    if (lowerText.includes('csp') || lowerText.includes('constraint') || lowerText.includes('satisfaction') || lowerText.includes('variables:')) {
        // Try to parse the user's specific CSP instance
        const parsedCSP = parseCSPQuestion(question);

        if (parsedCSP && parsedCSP.instance) {
            const instance = parsedCSP.instance;
            const selectedOptimization = parsedCSP.selectedOptimization || 'AC-3';

            const comparisonResults = runCSPComparison(
                instance.variables,
                instance.domains,
                instance.constraints,
                instance.partial
            );

            const remainingVars = instance.remainingVariables || instance.variables.filter(v => !(v in instance.partial));
            const selectedResult = comparisonResults.find(r => r.optimization === selectedOptimization) || comparisonResults.find(r => r.found) || comparisonResults[0];
            const solution = selectedResult.solution || {};
            const solutionText = Object.entries(solution)
                .filter(([k]) => remainingVars.includes(k))
                .map(([k, v]) => `${k}=${v}`)
                .join(', ');

            // Show parsed constraints with actual operators
            const constraintsText = Object.keys(instance.constraints).length > 0
                ? Object.keys(instance.constraints).map(key => {
                    const desc = instance.constraintDescriptions?.[key];
                    if (desc) return `• ${desc}`;
                    // Use formatConstraint to show the actual operator
                    const constraintFn = instance.constraints[key];
                    return `• ${formatConstraint(key, constraintFn)}`;
                }).join('\n')
                : '• (none)';

            return `**CSP Analysis Result** ✅\n\n**Problem:** Manual CSP Instance\n${instance.instanceText}\n\n**Constraints:**\n${constraintsText}\n\n**Solution (using ${selectedOptimization}):**\n${solutionText || 'No solution found'}\n\n**Performance:**\n- Nodes explored: ${selectedResult.nodesExplored}\n- Execution time: ${selectedResult.executionTime}ms\n- Status: ${selectedResult.found ? '✅ Solution found' : '❌ No solution'}\n\n**Optimization Comparison:**\n${comparisonResults.map(r => `• ${r.optimization}: ${r.found ? '✅' : '❌'} (${r.nodesExplored} nodes, ${r.executionTime}ms)`).join('\n')}\n\n📚 **Referință:** [CSP - Material](https://drive.google.com/file/d/1jXRaTY4Mv_BhQjzGS3SfBPiO-Cvi4RHR/view)`;
        }

        // Fallback to random instance if parsing fails
        const instance = generateRandomCSPInstance();
        const comparisonResults = runCSPComparison(
            instance.variables,
            instance.domains,
            instance.constraints,
            instance.partial
        );

        const remainingVars = instance.remainingVariables;
        // Use AC-3 as default optimization for random instances
        const selectedOptimization = 'AC-3';
        const bestResult = comparisonResults.find(r => r.optimization === selectedOptimization) || comparisonResults.find(r => r.found) || comparisonResults[0];
        const solution = bestResult.solution || {};
        const solutionText = Object.entries(solution)
            .filter(([k]) => remainingVars.includes(k))
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');

        // Show the randomly generated constraints with actual operators
        const constraintsText = Object.entries(instance.constraints)
            .map(([key, fn]) => `• ${formatConstraint(key, fn)}`)
            .join('\n') || '• (none)';

        return `**CSP Analysis Result**\n\n**Problem:** ${instance.template}\n${instance.instanceText}\n\n**Constraints:**\n${constraintsText}\n\n**Solution (using ${selectedOptimization}):**\n${solutionText || 'No solution found'}\n\n**Performance:**\n- Nodes explored: ${bestResult.nodesExplored}\n- Execution time: ${bestResult.executionTime}ms\n- Status: ${bestResult.found ? '✅ Solution found' : '❌ No solution'}\n\n**Optimization Comparison:**\n${comparisonResults.map(r => `• ${r.optimization}: ${r.found ? '✅' : '❌'} (${r.nodesExplored} nodes, ${r.executionTime}ms)`).join('\n')}\n\n📚 **Referință:** [CSP - Material](https://drive.google.com/file/d/1jXRaTY4Mv_BhQjzGS3SfBPiO-Cvi4RHR/view)`;
    }

    const parsedProblems = parseQuestionFromText(question);

    if (parsedProblems.length > 0) {
        const answers = parsedProblems.map(p => {
            if (p.name === 'Nash Equilibrium') {
                const answer = determineNashEquilibrium(p.instance.matrix);
                const problemVisual = p.instance.text.startsWith('Joc parsată')
                    ? `Matricea analizată:\n${p.instance.visual}`
                    : `Exemplu (generat):\n${p.instance.visual}`;

                return `**${p.name}**:\n${problemVisual}\n\n**Răspuns: ${answer.strategy}**\n\n*Justificare*: ${answer.reason}\n\n📚 **Referință:** [Nash Equilibrium - Slides](https://docs.google.com/presentation/d/1GeeTHsPKhCAlejgrrthnLVHIw-1gSBo5coW75vqh2lk/edit?slide=id.gfacdcaa922_0_38#slide=id.gfacdcaa922_0_38)`;
            } else {
                const answer = determineOptimalSearchStrategy(p.name, p.instance);
                return `**${p.name}** (${p.instance.text}):\n\n**Strategie optimă: ${answer.strategy}**\n\n*Justificare*: ${answer.reason}\n\n📚 **Referință:** [Search Strategies - Slides](https://docs.google.com/presentation/d/1X9k_hsLASrJ19ZY1_WoeCdkq2mO4hZPYu1k79X-85-Y/edit?slide=id.g630bf7f818_0_85#slide=id.g630bf7f818_0_85)`;
            }
        });
        return answers.join('\n\n---\n\n');
    }

    if (lowerText.includes('mrv') || lowerText.includes('minimum remaining values')) {
        return `**MRV (Minimum Remaining Values) Heuristic**\n\nAlways select the **unassigned variable with the smallest domain**.\n\n**Algorithm**:\n1. For each unassigned variable, count remaining possible values\n2. Pick the variable with fewest remaining values\n3. Assign a value and continue\n\n**Why it works**:\n- Fails fast when domain becomes empty\n- Reduces branching factor significantly\n- Finds unsolvable situations quickly\n\n**Example**: If x1 has domain {1}, while x2 has {1,2,3}, choose x1 first to detect conflicts early.\n\n**Performance**: Often 10-100x faster than basic backtracking for complex CSPs`;
    }

    if (lowerText.includes('forward checking')) {
        return `**Forward Checking**\n\nAfter assigning variable Xi = a:\n1. For each unassigned variable Xj connected to Xi\n2. Remove value a from Xj's domain if violating constraint\n3. If any domain becomes empty, backtrack immediately\n\n**Algorithm**:\n\`\`\`\nfor each neighbor Xj of Xi:\n  remove values from domain(Xj) inconsistent with Xi=a\n  if domain(Xj) is empty:\n    return FAILURE\n\`\`\`\n\n**Advantages**:\n- Detects dead ends earlier than basic backtracking\n- O(n²d) cost per assignment\n- Usually 5-50x faster than backtracking alone\n\n**When to use**:\n- Moderate to large CSPs\n- When forward compatibility matters`;
    }

    if (lowerText.includes('ac-3') || lowerText.includes('arc consistency')) {
        return `**AC-3 Algorithm (Arc Consistency)**\n\n**Definition**: A CSP is arc-consistent if for every variable Xi and neighbor Xj, for every value in Xi's domain, there exists a supporting value in Xj's domain.\n\n**AC-3 Algorithm**:\n1. Initialize queue with all arcs (Xi, Xj)\n2. While queue not empty:\n   - Remove arc (Xi, Xj)\n   - Remove values from Xi inconsistent with Xj\n   - If Xi domain changed, add all neighbors of Xi to queue\n3. If any domain empty, return UNSOLVABLE\n\n**Complexity**: O(ed³) where e = edges, d = domain size\n\n**When to use**:\n- As preprocessing before backtracking\n- For highly constrained problems\n- When you need maximum pruning\n\n**Advantage**: Most thorough consistency check\n**Disadvantage**: More expensive than Forward Checking`;
    }

    if (lowerText.includes('csp') || lowerText.includes('constraint satisfaction problem')) {
        return `**Constraint Satisfaction Problems (CSP)**\n\nA CSP consists of:\n• **Variables**: x1, x2, x3, ... (entities to assign)\n• **Domains**: Each variable has a set of possible values\n• **Constraints**: Restrictions on valid value combinations\n\n**Example**:\n- Variables: x1, x2, x3\n- Domains: x1∈{1,2,3}, x2∈{1,2}, x3∈{1,2,3,4}\n- Constraints: x1≠x2, x2<x3\n\n**Backtracking Optimizations**:\n\n1. **Basic Backtracking**: Try values one by one, backtrack on failure\n2. **MRV**: Choose variable with smallest domain first\n3. **Forward Checking**: Remove inconsistent values after each assignment\n4. **AC-3**: Ensure arc consistency before searching\n\n**Try asking**:\n- "Solve a CSP problem"\n- "What is MRV?"\n- "Explain Forward Checking"\n- "How does AC-3 work?"`;
    }

    if (lowerText.includes('database') || lowerText.includes('baza de date')) {
        return `**Database Status** 📊\n\nBaza de date conține:\n• ${db.db.problemTypes.length} tipuri de probleme\n• ${db.db.searchStrategies.length} strategii de căutare (${db.db.searchStrategies.filter(s => s.type === 'Uninformed').length} Uninformed + ${db.db.searchStrategies.filter(s => s.type === 'Informed').length} Informed)\n• ${db.db.strategyRules.length} reguli de mapare\n• ${db.db.questionLog.length} întrebări generate\n\nÎntreabă despre orice strategie sau problemă specifică!`;
    }

    if (lowerText.includes('uninformed') || lowerText.includes('neinformat')) {
        return `**Strategii Uninformed (fără heuristici)**\n\nAceste strategii nu disting între stări:\n\n• **BFS**: Găsește cel mai scurt drum (pentru costuri unitare)\n• **Iterative Deepening**: DFS cu limite, memorie redusă + completitudine\n• **Backtracking**: DFS cu pruning, elimină ramuri invalide (pentru CSP)\n\n**Când se folosesc**: Probleme mici/medii, lipsa heuristicilor bune.`;
    }

    if (lowerText.includes('informed') || lowerText.includes('heuristic')) {
        return `**Strategii Informed (cu heuristici)**\n\nFolosesc cunoștințe despre domeniu:\n\n• **Greedy Best-First**: Rapid, neoptim\n• **Simulated Annealing**: Scapă de minimele locale\n• **A***: Optim cu euristică admisibilă\n\n**Când se folosesc**: Probleme mari, existența heuristicilor bune.`;
    }

    if (lowerText.includes('a*') || lowerText.includes('a star')) {
        return `**A* Search**\n\nOptim dacă euristica h(n) este admisibilă.\n\n**Formula**: f(n) = g(n) + h(n)\n- g(n) = cost de la start la n\n- h(n) = estimare cost de la n la goal\n\n**Avantaje**: Găsește soluția optimă, eficient\n**Dezavantaje**: Memorie mare`;
    }

    if (lowerText.includes('backtracking')) {
        return `**Backtracking**\n\nDFS cu pruning pentru CSP.\n\n**Optimizations**:\n- MRV: Choose smallest domain first\n- Forward Checking: Check consistency\n- AC-3: Maintain arc consistency\n\n**Exemplu**: N-Queens, Sudoku`;
    }

    return `**Sunt gata să te ajut!** 🤖\n\nÎntreabă-mă despre:\n• **Strategii de căutare**: BFS, DFS, A*, Backtracking\n• **Probleme specifice**: N-Queens, Hanoi, Graph Coloring, Knight's Tour\n• **CSP**: Constraint Satisfaction Problems cu diverse optimizări\n• **Echilibru Nash**: Teoria jocurilor\n• **Minimax + Alpha-Beta**: Adversarial search cu pruning\n\n**Exemple de întrebări**:\n- "Solve a CSP problem"\n- "N-Queens cu N=8?"\n- "What is MRV?"\n- "Minimax alpha-beta"\n- "Nash Equilibrium (4,5) | (5,5)"\n- "Hanoi 12 discuri 4 tije?"`;
};

// Helper function to parse adversarial tree from text
const parseAdversarialTree = (text) => {
    try {
        const rootPlayer = text.match(/root\s*[=:]\s*(min|max)/i)?.[1]?.toUpperCase() || 'MAX';

        // Try to parse explicit parent and values arrays first (preferred)
        const parentsMatch = text.match(/(?:parents|tati|vector\s*de\s*tati|părinți)[^:]*[:=]?\s*\[([^\]]+)\]/i);
        const valuesMatch = text.match(/(?:values?|valori|frunze|leafs?)[^:]*[:=]?\s*\[([^\]]+)\]/i);

        if (parentsMatch && valuesMatch) {
            // Parse parents (allow -1)
            const parents = parentsMatch[1]
                .split(',')
                .map(v => v.trim())
                .map(v => parseInt(v, 10))
                .filter(v => !Number.isNaN(v));

            // Parse values (allow numbers, '-', 'null')
            const rawVals = valuesMatch[1]
                .split(',')
                .map(v => v.trim().toLowerCase());
            const values = rawVals.map(v => (v === '-' || v === 'null' || v === '') ? null : parseInt(v, 10));

            if (parents.length === 0 || parents.length !== values.length) return null;

            // Basic validation: root must be index 0 and be -1
            if (parents[0] !== -1) return null;
            // All other parents must be valid indices
            for (let i = 1; i < parents.length; i++) {
                if (parents[i] < 0 || parents[i] >= parents.length) return null;
            }

            // Reconstruct children from parent vector
            const children = Array.from({ length: parents.length }, () => []);
            for (let i = 1; i < parents.length; i++) {
                children[parents[i]].push(i);
            }

            // Compute depth via DFS
            const dfsDepth = (nodeId, d) => {
                if (!children[nodeId] || children[nodeId].length === 0) return d; // leaf
                let maxD = d;
                for (const c of children[nodeId]) {
                    maxD = Math.max(maxD, dfsDepth(c, d + 1));
                }
                return maxD;
            };
            const depth = dfsDepth(0, 0);

            // Assign values to all leaves that don't have them (ensure all leaves have values)
            for (let i = 0; i < parents.length; i++) {
                if (children[i].length === 0 && values[i] === null) {
                    values[i] = Math.floor(Math.random() * 11); // 0-10
                }
            }

            // Compute leaf values in left-to-right order via DFS
            const leafValues = [];
            const collectLeaves = (nodeId) => {
                if (!children[nodeId] || children[nodeId].length === 0) {
                    leafValues.push(values[nodeId]);
                    return;
                }
                for (const c of children[nodeId]) collectLeaves(c);
            };
            collectLeaves(0);

            const totalLeaves = parents.filter((_, i) => children[i].length === 0).length;

            return {
                template: 'Parsed Adversarial Tree',
                description: 'User-provided game tree',
                depth,
                parents,
                values,
                leafValues,
                rootPlayer,
                totalLeaves,
                numNodes: parents.length,
                text: `Arbore parsat (${parents.length} noduri, ${totalLeaves} frunze)`
            };
        }

        // Fallback: Try to extract leaf values only and build a balanced binary tree
        const leafMatch = text.match(/(?:leaves?|frunze|values?|valori)[^:]*[:=]?\s*\[([^\]]+)\]/i) ||
            text.match(/\[(\d+(?:\s*,\s*\d+)+)\]/);

        if (!leafMatch) return null;

        const leafValues = leafMatch[1].split(',').map(v => parseInt(v.trim(), 10)).filter(v => !Number.isNaN(v));
        if (leafValues.length < 2) return null;

        // Build a simple balanced binary tree from leaf values using parent vector
        const buildTreeFromLeaves = (leaves) => {
            // Calculate depth from number of leaves (assuming binary tree)
            const depth = Math.ceil(Math.log2(leaves.length));
            const totalNodes = Math.pow(2, depth + 1) - 1;

            const parents = [-1]; // Root has no parent
            const values = [null]; // Root is internal node

            // Build tree level by level
            for (let i = 1; i < totalNodes; i++) {
                parents.push(Math.floor((i - 1) / 2));
                values.push(null);
            }

            // Assign leaf values to the last level nodes
            const firstLeafIndex = totalNodes - leaves.length;
            leaves.forEach((val, idx) => {
                values[firstLeafIndex + idx] = val;
            });

            return { parents, values, depth, rootPlayer, leafValues: leaves, numNodes: totalNodes };
        };

        const tree = buildTreeFromLeaves(leafValues);
        return {
            template: 'Parsed Adversarial Tree',
            description: 'User-provided game tree',
            depth: tree.depth,
            parents: tree.parents,
            values: tree.values,
            leafValues: tree.leafValues,
            rootPlayer: tree.rootPlayer,
            totalLeaves: leafValues.length,
            numNodes: tree.numNodes,
            text: `Arbore parsat (${tree.numNodes} noduri, ${leafValues.length} frunze)`
        };
    } catch (e) {
        console.error('Error parsing adversarial tree:', e);
        return null;
    }
};

// Helper function to format tree structure for display
const formatTreeStructure = (instance) => {
    if (!instance || !instance.parents || !instance.values) return '';

    const { parents, values } = instance;
    const lines = [];
    const levels = {};

    // Reconstruct children from parent vector
    const children = Array.from({ length: parents.length }, () => []);
    for (let i = 1; i < parents.length; i++) {
        children[parents[i]].push(i);
    }

    // Group nodes by depth using BFS
    const calculateDepth = (nodeId, depth = 0) => {
        if (!levels[depth]) levels[depth] = [];
        levels[depth].push(nodeId);

        if (children[nodeId]) {
            children[nodeId].forEach(childId => calculateDepth(childId, depth + 1));
        }
    };

    calculateDepth(0);

    // Format each level
    Object.keys(levels).forEach(depth => {
        const levelNodes = levels[depth].map(nodeId => {
            if (values[nodeId] !== null) {
                return `[${values[nodeId]}]`; // Leaf node
            } else {
                return `(${nodeId})`; // Internal node
            }
        });
        lines.push(`Level ${depth}: ${levelNodes.join(' ')}`);
    });

    return lines.join('\n');
};

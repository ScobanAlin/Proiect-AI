import db from '../services/DatabaseService';
import { generateSearchInstance, determineOptimalSearchStrategy } from './searchInstanceGenerator';
import { generateNashInstance, determineNashEquilibrium } from './nashUtils';

export const extractMatrixFromText = (text) => {
    const payoffRegex = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;
    let rowsRaw = text.split(";");

    if (rowsRaw.length === 1) rowsRaw = text.split("\n");

    rowsRaw = rowsRaw.map(r => r.trim()).filter(r => r.length > 0);

    const matrix = [];
    for (const row of rowsRaw) {
        const matches = [...row.matchAll(payoffRegex)];
        if (matches.length === 0) continue;

        const parsedRow = matches.map(m => [parseInt(m[1], 10), parseInt(m[2], 10)]);
        matrix.push(parsedRow);
    }

    if (matrix.length === 0) return null;

    const colCount = matrix[0].length;
    if (!matrix.every(r => r.length === colCount)) {
        console.warn("Matrice inconsistentă");
        return null;
    }

    return matrix;
};

const parseSearchProblems = (text) => {
    const problems = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        // N-Queens
        if (line.toLowerCase().includes('queens') || line.toLowerCase().includes('regine')) {
            const nMatch = line.match(/n\s*=\s*(\d+)/i) || line.match(/(\d+)\s*regine/i) || line.match(/tablă\s*(\d+)x\s*\d+/i);
            if (nMatch) {
                const n = parseInt(nMatch[1]);
                problems.push({
                    name: 'N-Queens',
                    instance: { text: `N=${n} (tablă ${n}x${n})`, n, size: n }
                });
            }
        }

        // Hanoi
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

        // ...existing parsing logic for Graph Coloring and Knight's Tour...
    }

    if (problems.length === 0 && (text.toLowerCase().includes('strategie') || text.toLowerCase().includes('backtracking'))) {
        const searchProblems = db.getAllProblemTypes('Search');
        const randomProblem = searchProblems[Math.floor(Math.random() * searchProblems.length)];
        const instance = generateSearchInstance(randomProblem.name);
        problems.push({ name: randomProblem.name, instance });
    }

    return problems;
};

export const parseQuestionFromText = (text) => {
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
                    rows, cols,
                    text: `Joc parsat ${rows}x${cols}`,
                    visual: parsedMatrix.map(r => r.map(c => `(${c[0]}, ${c[1]})`).join(" | ")).join(" ;\n")
                }
            });
            return problems;
        }

        const exampleInstance = generateNashInstance();
        problems.push({ name: 'Nash Equilibrium', instance: exampleInstance });
        return problems;
    }

    const searchProblems = parseSearchProblems(text);
    problems.push(...searchProblems);
    return problems;
};

export const generateChatResponse = (question) => {
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

    if (qLower.includes('uninformed')) return `**Strategii Uninformed**\n\n• BFS, Iterative Deepening, Backtracking\n\n**Când se folosesc**: Probleme mici/medii, lipsa heuristicilor bune.`;
    if (qLower.includes('informed')) return `**Strategii Informed**\n\n• Greedy, Simulated Annealing, A*\n\n**Când se folosesc**: Probleme mari cu euristici bune.`;
    if (qLower.includes('database')) return `**Database**: ${db.db.problemTypes.length} probleme, ${db.db.searchStrategies.length} strategii, ${db.db.questionLog.length} întrebări generate`;

    return `**Sunt gata să te ajut!** 🤖\n\nÎntreabă despre strategii, probleme sau Nash Equilibrium.`;
};

import { db } from '../services/database.js';
import { generateSearchInstance, generateNashInstance } from './questionGenerator';
import { parseCSPQuestion } from './cspSolver';

const parseSearchProblems = (text) => {
    const problems = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
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

        if (line.toLowerCase().includes('graph') || line.toLowerCase().includes('graf') || line.toLowerCase().includes('colorare')) {
            const nodeMatch = line.match(/(\d+)\s*noduri/i);
            const edgeMatch = line.match(/(\d+)\s*muchii/i);
            const colorMatch = line.match(/(\d+)\s*culori/i);

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
                const finalDensity = densityRatio >= 0.6 ? 'dens' : densityRatio <= 0.3 ? 'rar' : 'mediu';

                problems.push({
                    name: 'Graph Coloring',
                    instance: {
                        text: `Graf ${finalDensity} cu ${nodes} noduri, ${edges} muchii, ${colors} culori`,
                        nodes,
                        edges,
                        colors,
                        density: finalDensity,
                        size: nodes
                    }
                });
            }
        }

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
    let rowsRaw = text.split(";");

    if (rowsRaw.length === 1) {
        rowsRaw = text.split("\n");
    }

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
        console.warn("Matrice inconsistentă — diferite număr de coloane pe rând.");
        return null;
    }

    return matrix;
};

export const parseQuestionFromText = (text) => {
    const problems = [];
    const lowerText = text.toLowerCase();

    // Check for CSP first
    if (lowerText.includes('csp') || lowerText.includes('constraint')) {
        const cspProblem = parseCSPQuestion(text);
        if (cspProblem) {
            problems.push(cspProblem);
            return problems;
        }
    }

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

        const exampleInstance = generateNashInstance();
        problems.push({
            name: 'Nash Equilibrium',
            instance: exampleInstance
        });

        return problems;
    }

    const searchProblems = parseSearchProblems(text);
    problems.push(...searchProblems);
    return problems;
};

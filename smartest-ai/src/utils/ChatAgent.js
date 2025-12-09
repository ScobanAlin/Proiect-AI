// src/utils/ChatAgent.js

import apiService from '../services/apiService'; // Folosim logica de determinare a strategiei de aici

// --- PARSER ÎMBUNĂTĂȚIT (simulează logica de parsare din backend) ---
const parseSearchProblems = (text) => {
    const problems = [];
    // Spargem textul și ignorăm linii goale
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
        // 1. N-Queens
        if (line.toLowerCase().includes('queens') || line.toLowerCase().includes('regine')) {
            const nMatch = line.match(/n\s*=\s*(\d+)/i) || line.match(/(\d+)\s*regine/i) || line.match(/tablă\s*(\d+)x\s*\d+/i);
            if (nMatch) {
                const n = parseInt(nMatch[1]);
                problems.push({
                    name: 'N-Queens',
                    // Generăm o instanță specifică bazată pe N din textul utilizatorului
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
                const pegs = pegMatch ? parseInt(pegMatch[1]) : 3; // Default 3 tije
                problems.push({
                    name: 'Generalized Hanoi',
                    instance: { text: `${discs} discuri, ${pegs} tije`, discs, pegs, size: discs }
                });
            }
        }

        // 3. Graph Coloring
        if (line.toLowerCase().includes('graph') || line.toLowerCase().includes('graf') || line.toLowerCase().includes('colorare')) {
            const nodeMatch = line.match(/(\d+)\s*noduri/i);
            const edgeMatch = line.match(/(\d+)\s*muchii/i); // <-- Parsare Muchii
            const colorMatch = line.match(/(\d+)\s*culori/i);
            const isDenseUser = line.toLowerCase().includes('dens'); // Indicația utilizatorului

            if (nodeMatch) {
                const nodes = parseInt(nodeMatch[1]);
                const maxEdges = nodes * (nodes - 1) / 2;

                // Preia valoarea muchiilor furnizate, sau o setează la null
                let edges = edgeMatch ? parseInt(edgeMatch[1]) : null;
                const colors = colorMatch ? parseInt(colorMatch[1]) : 3;

                // --- LOGICA DE VALIDARE ȘI ASIGURARE A INSTANȚEI ---

                // 1. Corectarea Muchiilor Imposibile/Lipsă
                if (edges === null || edges < nodes - 1 || edges > maxEdges) {
                    console.warn(`[ChatAgent] Muchii invalide (${edges}) sau lipsă pentru N=${nodes}. Generare aleatoare.`);

                    // Generăm o instanță validă din apiService pentru a obține muchii sigure
                    const generatedInstance = apiService.generateSearchInstance('Graph Coloring', { nodes, colors, density: isDenseUser ? 'dens' : 'rar' });
                    edges = generatedInstance.edges;

                    // Densitatea utilizatorului (isDenseUser) este ignorată, folosim cea generată
                    // pentru a avea un set de date consistent.
                }

                // 2. Determinarea Densității finale (pentru logica de strategie)
                const densityRatio = edges / maxEdges;
                let finalDensity;
                if (densityRatio >= 0.6) {
                    finalDensity = 'dens';
                } else if (densityRatio <= 0.3) {
                    finalDensity = 'rar';
                } else {
                    finalDensity = 'mediu';
                }

                // 3. Adăugarea Problemei
                problems.push({
                    name: 'Graph Coloring',
                    instance: {
                        text: `Graf ${finalDensity} cu ${nodes} noduri, ${edges} muchii, ${colors} culori`,
                        nodes: nodes,
                        edges: edges,
                        colors: colors,
                        // Folosim finalDensity pentru a determina strategia optimă
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

    // Dacă utilizatorul doar întreabă în general, generăm o instanță aleatoare.
    if (problems.length === 0 && (text.toLowerCase().includes('strategie') || text.toLowerCase().includes('backtracking') || text.toLowerCase().includes('a*'))) {
        const randomProblem = apiService.problems[Math.floor(Math.random() * apiService.problems.length)];
        const instance = apiService.generateSearchInstance(randomProblem.name);
        problems.push({
            name: randomProblem.name,
            instance: instance
        });
    }

    return problems;
};

// src/utils/ChatAgent.js

// ... (Restul codului, inclusiv parseSearchProblems)

const parseQuestionFromText = (text) => {
    const problems = [];
    const lowerText = text.toLowerCase();

    // 1. Detectare Echilibru Nash și Parsare Matrice
    if (lowerText.includes('nash') || lowerText.includes('echilibru') || lowerText.includes('matrice')) {

        const parsedMatrix = apiService.extractMatrixFromText(text);

        if (parsedMatrix && parsedMatrix.length >= 2) {
            // Parsarea a reușit! Creăm instanța din datele utilizatorului.
            const rows = parsedMatrix.length;
            const cols = parsedMatrix[0].length;

            const instance = {
                matrix: parsedMatrix,
                size: rows,
                text: `Joc parsată de utilizator ${rows}x${cols}.`,
                visual: parsedMatrix.map(row => row.map(cell => `(${cell[0]}, ${cell[1]})`).join(' | ')).join('\n')
            };

            problems.push({
                name: 'Nash Equilibrium',
                instance: instance
            });

            // ATENȚIE: Returnăm imediat pentru a nu intra în logica de generare aleatoare.
            return problems;

        } else if (lowerText.includes('nash')) {
            // Parsarea a eșuat sau nu au fost furnizate date, dar utilizatorul a întrebat. Generăm un exemplu.
            const exampleInstance = apiService.generateNashInstance();
            problems.push({
                name: 'Nash Equilibrium',
                instance: exampleInstance
            });
        }
    }

    // 2. Detectare Căutare (Search)
    const searchProblems = parseSearchProblems(text);
    problems.push(...searchProblems);

    return problems;
};

// ... (Restul funcțiilor)

// --- LOGICA AGENTULUI CONVERSAȚIONAL ---

export const generateChatResponse = (question) => {
    const parsedProblems = parseQuestionFromText(question);

    if (parsedProblems.length > 0) {
        const answers = parsedProblems.map(p => {
            if (p.name === 'Nash Equilibrium') {
                const answer = apiService.determineNashEquilibrium(p.instance.matrix);

                // Afișăm matricea parsată de utilizator, nu doar un text generic
                const problemVisual = p.instance.text.startsWith('Joc parsata')
                    ? `Matricea analizată:\n${p.instance.visual}`
                    : `Exemplu (generat):\n${p.instance.visual}`;

                return `**${p.name}**:\n${problemVisual}\n**Răspuns: ${answer.strategy}**\n*Justificare*: ${answer.reason}`;
            } else {
                // ... (Logica pentru Search)
                const answer = apiService.determineOptimalSearchStrategy(p.name, p.instance);
                return `**${p.name}** (${p.instance.text}):\n**Strategie optimă: ${answer.strategy}**\n*Justificare*: ${answer.reason}`;
            }
        });
        return answers.join('\n\n');
    }

    const qLower = question.toLowerCase();

    // ... (Răspunsuri la întrebări generale despre strategii - logica neschimbată)
    if (qLower.includes('uninformed') || qLower.includes('neinformat')) {
        return `**Strategii Uninformed (fără heuristici)**\n\nAceste strategii nu disting între stări:\n\n• **BFS**: Găsește cel mai scurt drum (pentru costuri unitare)\n• **A* (Iterative Deepening)**: DFS cu limite, memorie redusă + completitudine\n• **Backtracking**: DFS cu pruning, elimină ramuri invalide (pentru CSP)\n\n**Când se folosesc**: Probleme mici/medii, lipsa heuristicilor bune.`;
    }
    if (qLower.includes('informed') || qLower.includes('heuristic')) {
        return `**Strategii Informed (cu heuristici)**\n\nFolosesc cunoștințe despre domeniu pentru a ghida căutarea:\n\n• **Greedy Best-First**: Rapid, neoptim, alege starea cu h(n) minim\n• **Simulated Annealing**: Scapă de minimele locale prin acceptarea probabilistică a soluțiilor mai slabe\n• **A***: Optim dacă h admisibilă, f(n) = g(n) + h(n)\n\n**Când se folosesc**: Probleme mari unde uninformed e prea lent, existența heuristicilor bune.`;
    }
    if (qLower.includes('a*') || qLower.includes('a star')) {
        return apiService.determineOptimalSearchStrategy('Generalized Hanoi', { discs: 12, pegs: 4, size: 12 }).reason.replace('IDA*', 'A* Search') + '\n\n**A* Search** este optim dacă euristica $h(n)$ este admisibilă ($h(n) \le cost\ real$ până la goal).';
    }
    if (qLower.includes('backtracking')) {
        return apiService.determineOptimalSearchStrategy('N-Queens', { n: 8, size: 8 }).reason + '\n\n**Backtracking** este un DFS cu pruning (eliminare timpurie a ramurilor invalide) și este optim pentru probleme CSP mici, precum N-Queens (N≤8) sau Sudoku.';
    }
    if (qLower.includes('nash equilibrium') || qLower.includes('echilibru nash')) {
        const example = apiService.determineNashEquilibrium([[1, 2], [3, 0], [4, 1], [0, 4]]); // Exemplu clasic
        return `**Echilibrul Nash Pur**\n\n**Definiție**: O pereche de strategii $(\\sigma_1, \\sigma_2)$ este un Echilibru Nash Pur dacă strategia fiecărui jucător este un **Cel Mai Bun Răspuns** (Best Response) la strategia celuilalt.\n\n$P_1$ joacă $\\sigma_1$ maximizând utilitatea sa, presupunând că $P_2$ joacă $\\sigma_2$. $P_2$ face același lucru.\n\n${example.reason.replace('Echilibrele Nash Pure sunt', 'Exemplu de justificare:')}`;
    }

    return `**Sunt gata să te ajut!** Întreabă-mă despre strategii de căutare (A*, Backtracking, Greedy) sau despre o problemă specifică (N-Queens, Hanoi, Echilibru Nash).`;
};
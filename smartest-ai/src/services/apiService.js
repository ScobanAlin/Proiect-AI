// src/services/apiService.js

const uninformedStrategies = ['Random', 'BFS', 'Uniform Cost', 'DFS', 'Iterative Deepening', 'Backtracking', 'Bidirectional'];
const informedStrategies = ['Greedy Best-First', 'Hill Climbing', 'Simulated Annealing', 'Beam Search', 'A*', 'IDA*'];

const problems = [
    { name: 'N-Queens', description: 'Plasarea a N regine pe o tablă NxN' },
    { name: 'Generalized Hanoi', description: 'Mutarea discurilor între tije' },
    { name: 'Graph Coloring', description: 'Colorarea nodurilor unui graf' },
    { name: "Knight's Tour", description: 'Mutarea unui cal pe tabla de șah' }
];

// --- LOGICĂ GENERICĂ DE GENERARE INSTANȚE (care ar veni din MySQL logic) ---

const generateSearchInstance = (problemName) => {
    switch (problemName) {
        case 'N-Queens':
            const n = Math.floor(Math.random() * 8) + 4; // 4 la 11
            return {
                text: `N=${n} (tablă ${n}x${n})`,
                n: n,
                size: n
            };
        case 'Generalized Hanoi':
            const discs = Math.floor(Math.random() * 5) + 3; // 3 la 7
            const pegs = Math.floor(Math.random() * 2) + 3; // 3 la 4
            return {
                text: `${discs} discuri, ${pegs} tije`,
                discs: discs,
                pegs: pegs,
                size: discs
            };
        case 'Graph Coloring':
            const nodes = Math.floor(Math.random() * 16) + 5; // 5 la 20
            const colors = Math.floor(Math.random() * 3) + 3; // 3 la 5 culori
            const maxEdges = nodes * (nodes - 1) / 2;
            const density = Math.random() > 0.5 ? 'dens' : 'rar';

            let edges;
            if (density === 'dens') {
                // Graf dens: 40% - 90% din muchiile maxime
                edges = Math.floor(maxEdges * (0.4 + Math.random() * 0.5));
            } else {
                // Graf rar: 10% - 30% din muchiile maxime
                edges = Math.floor(maxEdges * (0.1 + Math.random() * 0.2));
            }
            // Ne asigurăm că avem minim N-1 muchii pentru a fi conex (dacă N>1)
            edges = Math.max(edges, nodes - 1);

            return {
                text: `Graf ${density} cu ${nodes} noduri, ${edges} muchii, ${colors} culori`,
                nodes: nodes,
                edges: edges,
                colors: colors,
                density: density,
                size: nodes
            };
        case "Knight's Tour":
            const size = Math.floor(Math.random() * 4) + 5; // 5 la 8
            return {
                text: `Tablă ${size}x${size}`,
                size: size
            };
        default:
            return { text: 'Instanță standard', size: 5 };
    }
};

const determineOptimalSearchStrategy = (problemName, instance) => {
    const size = instance.size || 5;

    // Aici se simulează interogarea MySQL pe tabela Problem_Strategy_Mapping
    switch (problemName) {
        case 'N-Queens':
            if (size <= 6) return { strategy: 'Backtracking', reason: `Pentru N=${size} (dimensiune mică), Backtracking simplu este optim.`, type: 'Search' };
            if (size <= 10) return { strategy: 'Iterative Deepening', reason: `Pentru N=${size} (dimensiune medie), Iterative Deepening combină avantajele DFS/BFS.`, type: 'Search' };
            return { strategy: 'Hill Climbing', reason: `Pentru N=${size} (dimensiune mare), metodele uninformed sunt lente. Hill Climbing (local search) este rapid.`, type: 'Search' };
        case 'Generalized Hanoi':
            if (instance.pegs === 3) {
                if (instance.discs <= 10) return { strategy: 'DFS', reason: `Pentru ${instance.discs} discuri și 3 tije, DFS urmărește soluția recursivă optimă.`, type: 'Search' };
                return { strategy: 'IDA*', reason: `Pentru ${instance.discs} discuri și 3 tije, IDA* reduce memoria față de A* clasic, menținând optimalitatea.`, type: 'Search' };
            }
            if (instance.discs <= 8) return { strategy: 'BFS', reason: `Pentru ${instance.discs} discuri și ${instance.pegs} tije, BFS garantează soluția optimă, spațiul fiind controlabil.`, type: 'Search' };
            return { strategy: 'A*', reason: `Pentru ${instance.discs} discuri și ${instance.pegs} tije (dimensiune mare), A* cu euristică Frame-Stewart oferă cel mai bun compromis.`, type: 'Search' };
        case 'Graph Coloring':
            const isDense = instance.density === 'dens';
            if (instance.nodes <= 10) return { strategy: 'Backtracking', reason: `Graf mic, Backtracking explorează sistematic, pruning rapid.`, type: 'Search' };
            if (size > 15 && isDense) return { strategy: 'Simulated Annealing', reason: `Graf mare și dens. SA scapă de minimele locale și explorează spațiul vast eficient.`, type: 'Search' };
            return { strategy: 'Greedy Best-First', reason: `Graf mediu. Greedy cu euristica "cel mai constrâns nod primul" găsește rapid soluții.`, type: 'Search' };
        case "Knight's Tour":
            if (size <= 6) return { strategy: 'Backtracking', reason: `Tablă mică. Backtracking cu pruning geometric găsește soluții rapid.`, type: 'Search' };
            return { strategy: 'Greedy Best-First', reason: `Tablă medie/mare. Greedy cu euristica Warnsdorff rezolvă în timp aproape liniar.`, type: 'Search' };
        default:
            return { strategy: 'BFS', reason: 'Strategie generală de căutare.', type: 'Search' };
    }
};

// --- LOGICĂ NASH EQUILIBRIUM ---

const generateNashInstance = () => {
    // Generează o matrice 2x2 sau 3x3 cu plăți între 0 și 5
    const size = Math.random() < 0.7 ? 2 : 3;
    const matrix = Array(size).fill(0).map(() =>
        Array(size).fill(0).map(() => [
            Math.floor(Math.random() * 6), // Player 1 Payoff
            Math.floor(Math.random() * 6)  // Player 2 Payoff
        ])
    );

    const description = `Joc în formă normală ${size}x${size}. Plățile sunt (P1, P2):`;

    return {
        matrix,
        size,
        text: description,
        visual: matrix.map(row => row.map(cell => `(${cell[0]}, ${cell[1]})`).join(' | ')).join('\n')
    };
};

const determineNashEquilibrium = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const equilibria = [];
    const player1BestResponses = new Array(cols).fill(-1);
    const player2BestResponses = new Array(rows).fill(-1);

    // 1. Determină cele mai bune răspunsuri ale Jucătorului 1 (Rânduri)
    for (let j = 0; j < cols; j++) {
        let maxPayoff = -1;
        let bestRow = -1;
        for (let i = 0; i < rows; i++) {
            if (matrix[i][j][0] > maxPayoff) {
                maxPayoff = matrix[i][j][0];
                bestRow = i;
            }
        }
        player1BestResponses[j] = bestRow;
    }

    // 2. Determină cele mai bune răspunsuri ale Jucătorului 2 (Coloane)
    for (let i = 0; i < rows; i++) {
        let maxPayoff = -1;
        let bestCol = -1;
        for (let j = 0; j < cols; j++) {
            if (matrix[i][j][1] > maxPayoff) {
                maxPayoff = matrix[i][j][1];
                bestCol = j;
            }
        }
        player2BestResponses[i] = bestCol;
    }

    // 3. Identifică Echilibrele Nash (unde răspunsurile sunt reciproce)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (player1BestResponses[j] === i && player2BestResponses[i] === j) {
                equilibria.push(`(Rând ${i + 1}, Coloana ${j + 1})`);
            }
        }
    }

    let strategyText;
    let reasonText;

    if (equilibria.length === 0) {
        strategyText = 'NU există';
        reasonText = 'Nu a fost găsit niciun Echilibru Nash Pur. Nicio pereche de strategii nu reprezintă reciproc Cel Mai Bun Răspuns (Best Response) pentru ambii jucători.';
    } else {
        strategyText = equilibria.join('; ');
        reasonText = `Echilibrele Nash Pure sunt ${strategyText}. Fiecare echilibru reprezintă o pereche de strategii unde strategia fiecărui jucător este Cel Mai Bun Răspuns la strategia celuilalt.`;
    }

    return {
        strategy: strategyText,
        reason: reasonText,
        type: 'GameTheory',
        rawEquilibria: equilibria
    };
};

// --- SERVICII EXPUNSE (API Endpoints Mock) ---

const generateQuestion = (type) => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulează latența API-ului
            if (type === 'search') {
                const shuffledProblems = [...problems].sort(() => Math.random() - 0.5);
                const selectedProblem = shuffledProblems[0];
                const instance = generateSearchInstance(selectedProblem.name);
                const correctAnswer = determineOptimalSearchStrategy(selectedProblem.name, instance);

                const question = {
                    id: Date.now(),
                    problem: { ...selectedProblem, instance },
                    correctAnswer: correctAnswer,
                    type: 'Search',
                    text: `Pentru problema **${selectedProblem.name}** cu instanța:\n\n${instance.text}\n\nCare este cea mai potrivită strategie de rezolvare?`
                };
                resolve(question);
            } else if (type === 'nash') {
                const instance = generateNashInstance();
                const correctAnswer = determineNashEquilibrium(instance.matrix);

                const question = {
                    id: Date.now(),
                    problem: { name: 'Nash Equilibrium', description: 'Găsirea Echilibrului Nash Pur într-un joc în formă normală', instance },
                    correctAnswer: correctAnswer,
                    type: 'GameTheory',
                    text: `Pentru jocul dat în forma normală cu plățile (P1, P2):\n\n${instance.visual}\n\n**Există Echilibru Nash Pur? Care este acesta?**`
                };
                resolve(question);
            } else {
                resolve({ error: 'Tip de întrebare necunoscut.' });
            }
        }, 800);
    });
};

const extractMatrixFromText = (text) => {
    // Încercăm să găsim toate grupurile de plăți (P1, P2) din întregul text, indiferent de format
    // Folosim o expresie regulată globală și cu mai multe linii

    // Regula caută (nr, nr) și permite spații albe extinse.
    const payoffRegex = /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;

    const allMatches = [...text.matchAll(payoffRegex)];

    if (allMatches.length === 0) {
        return null;
    }

    const allPayoffs = allMatches.map(match => [
        parseInt(match[1].trim()),
        parseInt(match[2].trim())
    ]);

    // Presupunem că matricea este 2x2 sau 3x3 (Total 4, 6 sau 9 perechi de plăți)
    const totalCells = allPayoffs.length;
    let size = 0;

    if (totalCells === 4) {
        size = 2; // 2x2
    } else if (totalCells === 9) {
        size = 3; // 3x3
    } else {
        // Nu putem determina o matrice pătrată standard (sau eșec la parsare)
        return null;
    }

    const matrix = [];
    let k = 0;
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(allPayoffs[k++]);
        }
        matrix.push(row);
    }

    return matrix;
};

const evaluateAnswer = (question, userAnswer) => {
    // Simulează evaluarea complexă (care ar fi făcută de backend)
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
            const allStrategies = [...uninformedStrategies, ...informedStrategies];
            let foundStrategy = null;

            for (const strategy of allStrategies) {
                if (userAnswerLower.includes(strategy.toLowerCase())) {
                    foundStrategy = strategy;
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
            // Verifică dacă utilizatorul a menționat toate echilibrele corecte
            const correctMatches = correctNash.filter(eq => userAnswerLower.includes(eq.toLowerCase().replace(/[()]/g, ''))).length;
            if (correctMatches === correctNash.length) {
                userIsCorrect = true;
            }
        }

        if (userIsCorrect) {
            score = 100;
            feedback = `Corect! Echilibrul Nash Pur este ${correctAnswer.strategy}.`;
        } else if (correctNash.length > 0 && userAnswerLower.includes(correctNash[0].toLowerCase().replace(/[()]/g, ''))) {
            score = 70;
            feedback = `Aproape! Ai identificat un echilibru corect, dar există mai multe (sau formularea este incompletă). Echilibrele corecte sunt ${correctAnswer.strategy}.`;
        } else {
            score = 0;
            feedback = `Răspuns incorect. Verifică din nou Cel Mai Bun Răspuns (Best Response) al fiecărui jucător la strategiile celuilalt.`;
        }
    }

    return { score, feedback, correctAnswer };
};

export default { generateSearchInstance, extractMatrixFromText, generateQuestion, evaluateAnswer, generateNashInstance, uninformedStrategies, informedStrategies, problems, determineOptimalSearchStrategy, determineNashEquilibrium };
import db from '../services/DatabaseService';

export const generateNashInstance = () => {
    const config = db.getGameConfig();
    const rows = Math.floor(Math.random() * 4) + 2;
    const cols = Math.floor(Math.random() * 4) + 2;

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

export const determineNashEquilibrium = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const equilibria = [];

    const player1BestResponses = Array.from({ length: cols }, () => []);
    const player2BestResponses = Array.from({ length: rows }, () => []);

    // Best responses for Player 1
    for (let j = 0; j < cols; j++) {
        let maxPayoff = -Infinity;
        for (let i = 0; i < rows; i++) {
            const payoff = matrix[i][j][0];
            if (payoff > maxPayoff) {
                maxPayoff = payoff;
                player1BestResponses[j] = [i];
            } else if (payoff === maxPayoff) {
                player1BestResponses[j].push(i);
            }
        }
    }

    // Best responses for Player 2
    for (let i = 0; i < rows; i++) {
        let maxPayoff = -Infinity;
        for (let j = 0; j < cols; j++) {
            const payoff = matrix[i][j][1];
            if (payoff > maxPayoff) {
                maxPayoff = payoff;
                player2BestResponses[i] = [j];
            } else if (payoff === maxPayoff) {
                player2BestResponses[i].push(j);
            }
        }
    }

    // Find intersections
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (player1BestResponses[j].includes(i) && player2BestResponses[i].includes(j)) {
                equilibria.push(`(Rând ${i + 1}, Coloana ${j + 1})`);
            }
        }
    }

    const strategyText = equilibria.length === 0 ? 'NU există' : equilibria.join('; ');
    const reasonText = equilibria.length === 0
        ? 'Niciun echilibru Nash pur.'
        : `Echilibrele Nash Pure sunt: ${strategyText}.`;

    return { strategy: strategyText, reason: reasonText, type: 'GameTheory', rawEquilibria: equilibria };
};

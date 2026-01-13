import { db } from '../services/database';

export const determineOptimalSearchStrategy = (problemName, instance) => {
    const problemType = db.getProblemTypeByName(problemName);
    if (!problemType) return { strategy: 'Unknown', reason: 'Problem not found', type: 'Search' };

    const size = instance.size || 5;
    const additionalConditions = {};

    if (problemName === 'Generalized Hanoi' && instance.pegs) {
        additionalConditions.pegs = instance.pegs;
    }
    if (problemName === 'Graph Coloring' && instance.density) {
        additionalConditions.density = instance.density;
    }

    const rules = db.getStrategyRules(problemType.id, size, additionalConditions);

    if (rules.length === 0) {
        return { strategy: 'BFS', reason: 'No specific rule found, using default BFS.', type: 'Search' };
    }

    const selectedRule = rules[0];
    const strategy = db.getStrategyById(selectedRule.strategy_id);

    return {
        strategy: strategy.name,
        reason: selectedRule.reason,
        type: 'Search'
    };
};

export const determineNashEquilibrium = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const equilibria = [];

    const player1BestResponses = Array.from({ length: cols }, () => []);
    const player2BestResponses = Array.from({ length: rows }, () => []);

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

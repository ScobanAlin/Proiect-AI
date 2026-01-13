import { db } from '../services/database.js';

export const evaluateAnswer = (question, userAnswer) => {
    const { type, correctAnswer, comparisonResults, bestStrategy } = question;
    const userAnswerLower = userAnswer.toLowerCase().trim();
    let score = 0;
    let feedback = '';

    if (type === 'Search') {
        const correctStrategyLower = correctAnswer.strategy.toLowerCase();

        if (userAnswerLower.includes(correctStrategyLower)) {
            score = 100;
            feedback = `Excelent! ${correctAnswer.strategy} este strategia cu cea mai bună performanță pentru această instanță (${bestStrategy.executionTime}ms).`;
        } else {
            const allStrategies = db.db.searchStrategies;
            let foundStrategy = null;
            let foundStrategyName = null;
            let isPartialMatch = false;

            for (const strategy of allStrategies) {
                const strategyLower = strategy.name.toLowerCase();

                if (userAnswerLower.includes(strategyLower)) {
                    foundStrategy = strategy;
                    foundStrategyName = strategy.name;
                    isPartialMatch = false;
                    break;
                }

                const strategyWords = strategyLower.split(/\s+|-/);
                const userWords = userAnswerLower.split(/\s+|-/);
                const matchedWords = strategyWords.filter(word =>
                    userWords.some(uword => word === uword || word.includes(uword) || uword.includes(word))
                );

                const wordMatchRatio = matchedWords.length / strategyWords.length;
                if ((wordMatchRatio >= 0.3) || (strategyWords[0] && userWords.some(w => w === strategyWords[0]))) {
                    foundStrategy = strategy;
                    foundStrategyName = strategy.name;
                    isPartialMatch = true;
                    break;
                }
            }

            if (foundStrategyName) {
                const mentionedResult = comparisonResults.find(r => r.strategyUsed === foundStrategyName);

                if (mentionedResult && mentionedResult === bestStrategy) {
                    if (isPartialMatch) {
                        score = 75;
                        feedback = `Bună! Ai identificat corect conceptul (${foundStrategyName}) care este cea mai rapidă (${bestStrategy.executionTime}ms), dar răspunsul complet este: ${correctAnswer.strategy}.`;
                    } else {
                        score = 100;
                        feedback = `Excelent! ${foundStrategyName} este strategia cu cea mai bună performanță (${bestStrategy.executionTime}ms).`;
                    }
                } else if (mentionedResult) {
                    const timeDiff = (parseFloat(mentionedResult.executionTime) - parseFloat(bestStrategy.executionTime)).toFixed(2);
                    score = 60;
                    feedback = `Bună răspuns! ${foundStrategyName} este o strategie validă (${mentionedResult.executionTime}ms), dar ${correctAnswer.strategy} este mai rapid cu ${timeDiff}ms.`;
                } else {
                    score = 40;
                    feedback = `Răspunsul tău menționează ${foundStrategyName}, dar ${correctAnswer.strategy} este mai rapid pentru această instanță specifică (${bestStrategy.executionTime}ms).`;
                }
            } else {
                score = 0;
                feedback = `Răspunsul nu menționează o strategie validă. Strategii testate: ${comparisonResults.map(r => r.strategyUsed).join(', ')}.`;
            }
        }
    } else if (type === 'Adversarial') {
        const nums = (userAnswer.match(/-?\d+/g) || []).map(n => parseInt(n, 10));
        const userRoot = nums[0];
        const userVisited = nums[1];
        const rootOk = userRoot === correctAnswer.rootValue;
        const visitedOk = userVisited === correctAnswer.visitedLeaves;

        if (rootOk && visitedOk) {
            score = 100;
            feedback = `Corect! Valoarea rădăcinii este ${correctAnswer.rootValue} și au fost vizitate ${correctAnswer.visitedLeaves} frunze cu tăiere αβ.`;
        } else if (rootOk || visitedOk) {
            score = rootOk ? 70 : 50;
            feedback = rootOk
                ? `Aproape! Valoarea rădăcinii (${correctAnswer.rootValue}) e corectă, dar frunzele vizitate sunt ${correctAnswer.visitedLeaves}.`
                : `Parțial! Frunzele vizitate (${correctAnswer.visitedLeaves}) sunt corecte, dar valoarea rădăcinii este ${correctAnswer.rootValue}.`;
        } else {
            score = 0;
            feedback = `Răspuns incorect. Valoarea corectă la rădăcină este ${correctAnswer.rootValue}, iar numărul de frunze vizitate este ${correctAnswer.visitedLeaves}.`;
        }
    } else if (type === 'GameTheory') {
        // Parse user answer in format (row,col) or (row,col) (row,col)
        const parseNashAnswer = (answer) => {
            const normalized = answer.trim().toLowerCase();
            const singlePattern = /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
            const matches = [...normalized.matchAll(singlePattern)];

            if (matches.length === 0) {
                return null;
            }

            return matches.map(match => ({
                row: parseInt(match[1]),  // Keep as 1-indexed to match correctAnswer format
                col: parseInt(match[2]),
                original: match[0]
            }));
        };

        // Parse correct answer - should be array like ["(1,2)", "(2,1)"] or string like "(1,2) (2,1)"
        const parseCorrectNash = (answer) => {
            let answerString = '';
            if (Array.isArray(answer)) {
                answerString = answer.join(' ');
            } else if (typeof answer === 'string') {
                answerString = answer;
            } else {
                return [];
            }

            const singlePattern = /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
            const matches = [...answerString.matchAll(singlePattern)];

            return matches.map(match => ({
                row: parseInt(match[1]),
                col: parseInt(match[2]),
                original: match[0]
            }));
        };

        const userEquilibria = parseNashAnswer(userAnswer.trim());
        const correctEquilibria = parseCorrectNash(correctAnswer.rawEquilibria || correctAnswer.strategy || '');
        const userAnswerLower = userAnswer.toLowerCase().trim();

        // Handle "no Nash equilibrium" case
        if (!userEquilibria || userEquilibria.length === 0) {
            if (correctEquilibria.length === 0 &&
                (userAnswerLower.includes('nu există') ||
                    userAnswerLower.includes('no nash') ||
                    userAnswerLower.includes('no pure'))) {
                score = 100;
                feedback = `Corect! Nu există echilibru Nash pur pentru această matrice.`;
            } else if (correctEquilibria.length === 0) {
                score = 0;
                feedback = `Răspuns incorect. Nu există echilibru Nash pur pentru această matrice. Trebuie să răspunzi "Nu există echilibru Nash pur".`;
            } else {
                score = 0;
                feedback = `Răspuns incorect. Folosește formatul: (rând,coloană). Exemplu: (1,2) sau (1,2) (2,1) pentru mai multe echilibre.`;
            }
        } else if (correctEquilibria.length === 0) {
            score = 0;
            feedback = `Răspuns incorect. Nu există echilibru Nash pur pentru această matrice.`;
        } else {
            // Count how many correct equilibria were found
            let correctCount = 0;
            const foundEquilibria = [];

            for (const userEq of userEquilibria) {
                for (const correctEq of correctEquilibria) {
                    if (userEq.row === correctEq.row && userEq.col === correctEq.col) {
                        correctCount++;
                        foundEquilibria.push(userEq.original);
                        break;
                    }
                }
            }

            const totalCorrect = correctEquilibria.length;
            const correctAnswerFormatted = correctEquilibria.map(e => `(${e.row},${e.col})`).join(' ');

            if (correctCount === totalCorrect && userEquilibria.length === totalCorrect) {
                // Perfect: found all equilibria and no extra
                score = 100;
                feedback = `Excelent! Ai găsit toate echilibrele Nash corecte: ${correctAnswerFormatted}`;
            } else if (correctCount === totalCorrect) {
                // Found all correct but also included wrong ones
                const penaltyPerWrong = 10;
                const extraWrong = userEquilibria.length - correctCount;
                const penalty = Math.min(20, extraWrong * penaltyPerWrong);
                score = Math.max(70, 100 - penalty);
                feedback = `Bun! Ai găsit toate echilibrele corecte (${foundEquilibria.join(' ')}), dar ai inclus și ${extraWrong} răspunsuri greșite. Scor: ${score}%.`;
            } else if (correctCount > 0) {
                // Found some correct equilibria
                const percentPerEquilibrium = Math.floor(80 / totalCorrect);
                score = Math.min(95, correctCount * percentPerEquilibrium);
                const remaining = totalCorrect - correctCount;
                feedback = `Parțial corect! Ai găsit ${correctCount}/${totalCorrect} echilibre (${foundEquilibria.join(' ')}). Te mai lipsesc ${remaining}. Răspunsul complet: ${correctAnswerFormatted}. Scor: ${score}%.`;
            } else {
                // Found no correct equilibria
                score = 0;
                feedback = `Răspuns incorect. Nu ai identificat corect niciun echilibru Nash. Echilibrele corecte sunt: ${correctAnswerFormatted}`;
            }
        }
    } else if (type === 'CSP') {
        // Parse user input: format like "V3=Red, V4=Green, V5=Blue"
        const parseCSPAnswer = (answer) => {
            const assignments = {};
            const pairs = answer.split(/[,;]/);

            for (const pair of pairs) {
                const match = pair.trim().match(/([A-Za-z0-9]+)\s*=\s*([A-Za-z0-9]+)/);
                if (match) {
                    assignments[match[1]] = match[2];
                }
            }

            return assignments;
        };

        const userAssignments = parseCSPAnswer(userAnswer);
        const correctSolution = question.correctAnswer.rawSolution;
        const remainingVars = question.remainingVariables;

        let correctCount = 0;
        const correctAssignments = {};

        for (const variable of remainingVars) {
            if (variable in correctSolution) {
                correctAssignments[variable] = correctSolution[variable];
                if (variable in userAssignments && userAssignments[variable] === correctSolution[variable]) {
                    correctCount++;
                }
            }
        }

        const score = remainingVars.length > 0 ? Math.round((correctCount / remainingVars.length) * 100) : 0;
        let feedback = '';

        if (score === 100) {
            feedback = `Excelent! All variables correctly assigned using ${question.selectedOptimization}.`;
        } else if (score >= 70) {
            feedback = `Good! You got ${correctCount}/${remainingVars.length} variables correct with ${question.selectedOptimization}.`;
        } else if (score > 0) {
            feedback = `Partial credit. You got ${correctCount}/${remainingVars.length} variables. The correct assignments are: ${Object.entries(correctAssignments).map(([k, v]) => `${k}=${v}`).join(', ')}`;
        } else {
            feedback = `Incorrect. Using ${question.selectedOptimization}, the correct assignments are: ${Object.entries(correctAssignments).map(([k, v]) => `${k}=${v}`).join(', ')}`;
        }

        return {
            score,
            feedback,
            correctAnswer: question.correctAnswer
        };
    }

    return { score, feedback, correctAnswer };
};

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
        const parseNashAnswer = (answer) => {
            let normalized = answer
                .replace(/rând\s*/gi, '')
                .replace(/coloana\s*/gi, '')
                .replace(/row\s*/gi, '')
                .replace(/col\s*/gi, '')
                .toLowerCase();

            const fullPattern = /\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*[;,]\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
            const fullMatches = [...normalized.matchAll(fullPattern)];

            if (fullMatches.length > 0) {
                return fullMatches.map(match => ({
                    p1Row: parseInt(match[1]) - 1,  // Convert to 0-indexed
                    p1Col: parseInt(match[2]) - 1,  // Convert to 0-indexed
                    p2Row: parseInt(match[3]) - 1,  // Convert to 0-indexed
                    p2Col: parseInt(match[4]) - 1,  // Convert to 0-indexed
                    original: match[0],
                    isPartial: false
                }));
            }

            const singlePattern = /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g;
            const singleMatches = [...normalized.matchAll(singlePattern)];

            if (singleMatches.length > 0) {
                return singleMatches.map(match => ({
                    p1Row: parseInt(match[1]) - 1,  // Convert to 0-indexed
                    p1Col: parseInt(match[2]) - 1,  // Convert to 0-indexed
                    p2Row: null,
                    p2Col: null,
                    original: match[0],
                    isPartial: true
                }));
            }

            return null;
        };

        const userEquilibria = parseNashAnswer(userAnswer.trim());
        const correctNash = correctAnswer.rawEquilibria || [];

        if (!userEquilibria || userEquilibria.length === 0) {
            if (correctNash.length === 0 && (userAnswerLower.includes('nu există') || userAnswerLower.includes('no nash'))) {
                score = 100;
                feedback = `Corect! Nu există echilibru Nash pur pentru această matrice.`;
            } else {
                score = 0;
                feedback = `Răspuns incorect. Folosește formatul: (rând, coloană) sau (rând, coloană);(rând, coloană). Exemplu: (3, 1) sau (2, 2);(3, 1)`;
            }
        } else if (correctNash.length === 0) {
            score = 0;
            feedback = `Răspuns incorect. Nu există echilibru Nash pur pentru această matrice.`;
        } else {
            const parseCorrectAnswer = (eq) => {
                let match = eq.match(/[Rr]âmd\s+(\d+).*[Cc]oloana\s+(\d+)/i);
                if (match) {
                    return { row: parseInt(match[1]) - 1, col: parseInt(match[2]) - 1 };
                }
                match = eq.match(/[Rr]ow\s+(\d+).*[Cc]olumn\s+(\d+)/i);
                if (match) {
                    return { row: parseInt(match[1]) - 1, col: parseInt(match[2]) - 1 };
                }
                return null;
            };

            const correctPairs = [];
            if (correctNash.length > 0) {
                const pairString = correctNash[0];
                const parts = pairString.split(';');
                if (parts.length === 2) {
                    const p1 = parseCorrectAnswer(parts[0]);
                    const p2 = parseCorrectAnswer(parts[1]);
                    if (p1 && p2) {
                        correctPairs.push({ p1Row: p1.row, p1Col: p1.col, p2Row: p2.row, p2Col: p2.col });
                    }
                }
            }

            if (correctPairs.length === 0) {
                const correctMatches = correctNash.filter(eq =>
                    userAnswerLower.includes(eq.toLowerCase().replace(/[()]/g, ''))
                ).length;

                if (correctMatches === correctNash.length) {
                    score = 100;
                    feedback = `Corect! Echilibrul Nash Pur este ${correctAnswer.strategy}.`;
                } else if (correctNash.length > 0 && userAnswerLower.includes(correctNash[0].toLowerCase().replace(/[()]/g, ''))) {
                    score = 70;
                    feedback = `Aproape! Ai identificat un echilibru corect, dar răspunsul complet este: ${correctAnswer.strategy}.`;
                } else {
                    score = 0;
                    feedback = `Răspuns incorect. Echilibrele corecte sunt: ${correctAnswer.strategy}`;
                }
            } else {
                let matchedCount = 0;
                const matchedEquilibria = [];
                let hasPartialInput = userEquilibria.some(e => e.isPartial);

                for (const userEq of userEquilibria) {
                    for (const correctEq of correctPairs) {
                        let isMatch = false;

                        if (userEq.isPartial) {
                            // userEq is already 0-indexed after parsing
                            // correctEq is 0-indexed from parseCorrectAnswer
                            isMatch = (userEq.p1Row === correctEq.p1Row && userEq.p1Col === correctEq.p1Col) ||
                                (userEq.p1Row === correctEq.p2Row && userEq.p1Col === correctEq.p2Col);
                        } else {
                            // Both are 0-indexed, direct comparison
                            isMatch = (userEq.p1Row === correctEq.p1Row &&
                                userEq.p1Col === correctEq.p1Col &&
                                userEq.p2Row === correctEq.p2Row &&
                                userEq.p2Col === correctEq.p2Col);
                        }

                        if (isMatch) {
                            matchedCount++;
                            matchedEquilibria.push(userEq.original);
                            break;
                        }
                    }
                }

                if (matchedCount === correctPairs.length && userEquilibria.length === correctPairs.length) {
                    score = 100;
                    feedback = `Excelent! Ai găsit toate echilibrele Nash: ${matchedEquilibria.join(', ')}.`;
                } else if (matchedCount > 0) {
                    // Apply partial credit with penalty for incomplete answers
                    // Base percentage: 60% per correct equilibrium found
                    const percentagePerEquilibrium = 60;
                    const partialScore = (matchedCount / correctPairs.length) * percentagePerEquilibrium;

                    // Bonus if all user answers are correct (no wrong answers)
                    const allUserAnswersCorrect = matchedCount === userEquilibria.length;
                    const bonus = allUserAnswersCorrect ? 10 : 0;

                    score = Math.min(95, Math.round(partialScore + bonus));

                    const formattedCorrectAnswer = correctAnswer.strategy
                        .replace(/Rând\s+/gi, '')
                        .replace(/Coloana\s+/gi, '');

                    if (hasPartialInput && matchedCount > 0) {
                        feedback = `Bun răspuns parțial! Ai identificat corect o parte din echilibru: ${matchedEquilibria.join(', ')}, dar răspunsul complet este: ${formattedCorrectAnswer}`;
                    } else {
                        feedback = `Parțial corect! Ai găsit ${matchedCount} din ${correctPairs.length} echilibre (${score}%). Răspunsul complet: ${formattedCorrectAnswer}`;
                    }
                } else {
                    score = 0;
                    const formattedCorrectAnswer = correctAnswer.strategy
                        .replace(/Rând\s+/gi, '')
                        .replace(/Coloana\s+/gi, '');
                    feedback = `Răspuns incorect. Echilibrele Nash corecte sunt: ${formattedCorrectAnswer}`;
                }
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

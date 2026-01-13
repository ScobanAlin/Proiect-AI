import jsPDF from 'jspdf';

/**
 * Generate a test with specified types and difficulty
 * @param {Array} questionTypes - Array of question types (e.g., ['search', 'csp', 'nash', 'adversarial'])
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {number} numQuestions - Number of questions to generate (default 10)
 * @returns {Object} { questions, answers }
 */
export const generateTest = async (questionTypes, difficulty, numQuestions = 10) => {
    const { generateQuestion } = await import('./questionGenerator');

    const questions = [];
    const answers = [];

    const difficultyConfig = {
        easy: {
            difficulty: 'easy',
            nQueens: 4,
            hanoi: 3,
            graphNodes: 4,
            graphEdges: 4,
            knightSize: 4,
            cspSize: 2,
            advDepth: 2
        },
        medium: {
            difficulty: 'medium',
            nQueens: 6,
            hanoi: 5,
            graphNodes: 6,
            graphEdges: 8,
            knightSize: 5,
            cspSize: 3,
            advDepth: 3
        },
        hard: {
            difficulty: 'hard',
            nQueens: 8,
            hanoi: 7,
            graphNodes: 8,
            graphEdges: 12,
            knightSize: 6,
            cspSize: 4,
            advDepth: 3
        }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig.medium;

    // Generate questions
    for (let i = 0; i < numQuestions; i++) {
        const typeIndex = i % questionTypes.length;
        const questionType = questionTypes[typeIndex];

        try {
            const question = await new Promise((resolve) => {
                generateQuestion(questionType, config).then(resolve);
            });

            questions.push({
                number: i + 1,
                type: questionType,
                ...question
            });

            answers.push({
                number: i + 1,
                type: questionType,
                question: question.text,
                correctAnswer: question.correctAnswer,
                problem: question.problem
            });
        } catch (error) {
            console.error(`Error generating question ${i + 1}:`, error);
        }
    }

    return { questions, answers };
};

/**
 * Generate PDF for questions
 * @param {Array} questions - Array of question objects
 * @param {string} difficulty - Difficulty level
 * @returns {void} - Triggers download of PDF
 */
export const generateQuestionsPDF = (questions, difficulty) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    let yPosition = margin;
    const lineHeight = 7;
    const fontSize = 11;

    // Header
    doc.setFontSize(16);
    doc.text('AI Test - Questions', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Difficulty: ${difficulty.toUpperCase()}`, margin, yPosition);
    doc.text(`Total Questions: ${questions.length}`, pageWidth - margin - 50, yPosition);
    yPosition += 12;

    // Questions
    doc.setFontSize(fontSize);

    questions.forEach((q, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 20) {
            doc.addPage();
            yPosition = margin;
        }

        // Question number and type
        doc.setFont(undefined, 'bold');
        doc.text(`Question ${q.number} - ${q.type.toUpperCase()}`, margin, yPosition);
        yPosition += lineHeight + 2;

        // Question text
        doc.setFont(undefined, 'normal');
        const textLines = doc.splitTextToSize(q.text, maxWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * lineHeight + 5;

        // Add some spacing
        yPosition += 3;
    });

    // Save PDF
    doc.save(`AI_Test_Questions_${difficulty}.pdf`);
};

/**
 * Generate PDF for answers
 * @param {Array} answers - Array of answer objects
 * @param {string} difficulty - Difficulty level
 * @returns {void} - Triggers download of PDF
 */
export const generateAnswersPDF = (answers, difficulty) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    let yPosition = margin;
    const lineHeight = 7;
    const fontSize = 10;

    // Header
    doc.setFontSize(16);
    doc.text('AI Test - Answer Key', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Difficulty: ${difficulty.toUpperCase()}`, margin, yPosition);
    doc.text(`Total Questions: ${answers.length}`, pageWidth - margin - 50, yPosition);
    yPosition += 12;

    // Answers
    doc.setFontSize(fontSize);

    answers.forEach((a, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 30) {
            doc.addPage();
            yPosition = margin;
        }

        // Question number and type
        doc.setFont(undefined, 'bold');
        doc.text(`Q${a.number} - ${a.type.toUpperCase()}`, margin, yPosition);
        yPosition += lineHeight + 1;

        // Question text
        doc.setFont(undefined, 'normal');
        const questionLines = doc.splitTextToSize(`Question: ${a.question}`, maxWidth);
        doc.text(questionLines, margin, yPosition);
        yPosition += questionLines.length * lineHeight + 3;

        // Correct answer
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 0); // Green

        const answerText = formatAnswer(a.correctAnswer);
        const answerLines = doc.splitTextToSize(`Answer: ${answerText}`, maxWidth);
        doc.text(answerLines, margin, yPosition);
        yPosition += answerLines.length * lineHeight + 3;

        // Reset color
        doc.setTextColor(0, 0, 0);

        // Add separator
        yPosition += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
    });

    // Save PDF
    doc.save(`AI_Test_Answers_${difficulty}.pdf`);
};

/**
 * Format answer for display
 * @param {*} correctAnswer - The correct answer object
 * @returns {string} - Formatted answer string
 */
const formatAnswer = (correctAnswer) => {
    if (!correctAnswer) return 'N/A';

    switch (correctAnswer.type) {
        case 'Search':
            return `Strategy: ${correctAnswer.strategy || 'Unknown'}`;

        case 'Nash Equilibrium':
            return `Strategy: ${correctAnswer.strategy || 'Unknown'}`;

        case 'CSP':
            // CSP correctAnswer has structure: { strategy, reason, type, rawSolution }
            if (correctAnswer.rawSolution && typeof correctAnswer.rawSolution === 'object') {
                return Object.entries(correctAnswer.rawSolution)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(', ');
            }
            return correctAnswer.strategy || String(correctAnswer);

        case 'Adversarial':
            return `Root Value: ${correctAnswer.rootValue}, Visited Leaves: ${correctAnswer.visitedLeaves}`;

        default:
            return String(correctAnswer);
    }
};

/**
 * Generate both PDFs and trigger downloads
 * @param {Array} questions - Questions array
 * @param {Array} answers - Answers array
 * @param {string} difficulty - Difficulty level
 */
export const generateBothPDFs = (questions, answers, difficulty) => {
    // Generate questions PDF
    setTimeout(() => {
        generateQuestionsPDF(questions, difficulty);
    }, 100);

    // Generate answers PDF
    setTimeout(() => {
        generateAnswersPDF(answers, difficulty);
    }, 200);
};

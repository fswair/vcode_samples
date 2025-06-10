let currentUsername = localStorage.getItem('username') || null;
const API_URL = 'http://localhost:8000';

window.onload = function() {
    if (currentUsername) {
        document.getElementById('username').value = currentUsername;
        document.getElementById('question-section').style.display = 'block';
    }
    fetchQuestions();
};

function setUsername() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        currentUsername = username;
        localStorage.setItem('username', username);
        document.getElementById('question-section').style.display = 'block';
        fetchQuestions();
    } else {
        alert('Please enter a valid username');
    }
}

async function submitQuestion() {
    const questionText = document.getElementById('question').value.trim();
    if (!questionText) {
        alert('Please enter a question');
        return;
    }

    const response = await fetch(`${API_URL}/questions/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: currentUsername,
            question: questionText
        }),
    });

    if (response.ok) {
        document.getElementById('question').value = '';
        fetchQuestions();
    } else {
        alert('Failed to submit question');
    }
}

async function fetchQuestions() {
    let url = `${API_URL}/questions/`;
    if (currentUsername) {
        url = `${API_URL}/questions/${currentUsername}/`;
    }
    const response = await fetch(url);
    const questions = await response.json();
    const questionsDiv = document.getElementById('questions');
    questionsDiv.innerHTML = '';

    questions.forEach(q => {
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        let answersHTML = q.answers.map(a => `<p><strong>Answer:</strong> ${a}</p>`).join('');
        questionItem.innerHTML = `
            <p><strong>${q.username} asks:</strong> ${q.question}</p>
            ${answersHTML}
            <div class="answer-form">
                <textarea placeholder="Answer this question..." id="answer-${q.id}"></textarea>
                <button onclick="submitAnswer(${q.id})">Submit Answer</button>
            </div>
        `;
        questionsDiv.appendChild(questionItem);
    });
}

async function submitAnswer(questionId) {
    const answerText = document.getElementById(`answer-${questionId}`).value.trim();
    if (!answerText) {
        alert('Please enter an answer');
        return;
    }

    const response = await fetch(`${API_URL}/questions/${questionId}/answers/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            answer: answerText
        }),
    });

    if (response.ok) {
        document.getElementById(`answer-${questionId}`).value = '';
        fetchQuestions();
    } else {
        alert('Failed to submit answer');
    }
}

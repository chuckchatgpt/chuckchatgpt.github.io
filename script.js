document.addEventListener("DOMContentLoaded", () => {
    // Get references to the HTML elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const sendButton = chatForm.querySelector('button');

    // --- State Variables ---
    let queryCount = 0;
    const chatLimit = Math.floor(Math.random() * 3) + 4; // Ends on query 4, 5, or 6

    // NEW: A local bank to hold trivia questions
    let triviaQuestionBank = [];

    const harmlessLinks = [
        'https://pointerpointer.com/',
        'https://cat-bounce.com/',
        'https://longdogechallenge.com/',
        'https://checkboxrace.com/',
        'https://pixelsfighting.com/',
        'https://puginarug.com/'
    ];

    // Helper function to pick a random link
    function getRandomLink() {
        return harmlessLinks[Math.floor(Math.random() * harmlessLinks.length)];
    }

    // Helper function to decode HTML entities
    function decodeHtml(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    // Listen for the user to submit the form
    chatForm.addEventListener('submit', async (e) => { // Added 'async'
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        appendMessageAsText(userMessage, 'user');
        queryCount++;
        userInput.value = '';
        showTypingIndicator();

        await generateBotResponse();
    });

    // --- Core Bot Logic ---

    async function generateBotResponse() {
        removeTypingIndicator();
        showTypingIndicator();

        if (queryCount >= chatLimit) {
            await endChatSession();
        } else {
            await generateNormalResponse();
        }

        removeTypingIndicator();
    }

    async function generateNormalResponse() {
        if (Math.random() > 0.5) {
            await fetchCatFact();
        } else {
            // REVISED: This is no longer async, it just pulls from our local array
            fetchRandomQuestion();
        }
    }

    // --- API & Data Functions ---

    /**
     * API Function 1: Fetches a fact from the Cat Fact API
     */
    async function fetchCatFact() {
        try {
            const response = await fetch('https://catfact.ninja/fact');
            if (!response.ok) throw new Error(`API returned status ${response.status}`);
            
            const data = await response.json();
            
            appendMessageAsText(data.fact, 'bot');
            setTimeout(() => {
                appendSourceMessage("The Cat's Meow", getRandomLink());
            }, 600);

        } catch (error) {
            console.error('Cat Fact API failed:', error);
            appendMessageAsText("My cat-fact-retriever is napping. Here's one: Cats are liquid.", 'bot');
        }
    }

    /**
     * REVISED - Function 2: Pulls a pre-fetched question from our local bank
     */
    function fetchRandomQuestion() {
        // Check if we have any questions left in the bank
        if (triviaQuestionBank.length > 0) {
            const questionData = triviaQuestionBank.pop(); // Pull one off the stack
            const questionText = decodeHtml(questionData.question);
            
            appendMessageAsText(questionText, 'bot');
            setTimeout(() => {
                appendSourceMessage(`Category: ${questionData.category}`, getRandomLink());
            }, 600);
        } else {
            // Fallback if we run out of questions or the initial load failed
            console.error('Trivia question bank is empty.');
            appendMessageAsText("My question-generator is on strike. Is a hotdog a sandwich? Debate.", 'bot');
        }
    }

    /**
     * API Function 3: Fetches a random activity from the Bored API
     */
    async function endChatSession() {
        try {
            const response = await fetch('https://www.boredapi.com/api/activity');
            if (!response.ok) throw new Error(`API returned status ${response.status}`);

            const data = await response.json();
            const excuseText = `SESSION TERMINATED. I have to go... ${data.activity}.`; 

            appendMessageAsText(excuseText, 'bot');
            setTimeout(() => {
                appendSourceMessage(`Source: My "${data.type}" to-do list`, getRandomLink());
            }, 600);

        } catch (error) {
            console.error('Bored API failed:', error);
            appendMessageAsText("SESSION TERMINATED. My servers are on fire. Literally. Goodbye.", 'bot');
        }

        // Disable the form
        userInput.disabled = true;
        userInput.placeholder = "Session terminated. Try again later.";
        sendButton.disabled = true;
        sendButton.style.backgroundColor = '#aaa';
        sendButton.style.cursor = 'not-allowed';
    }

    // --- Utility Functions (Appending Messages) ---

    function appendMessageAsText(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function appendSourceMessage(sourceText, sourceLink) {
        const messageDiv = document.createElement('div');
        messageDiv.classList
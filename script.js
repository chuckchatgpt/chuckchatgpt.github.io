document.addEventListener("DOMContentLoaded", () => {
    // Get references to the HTML elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const sendButton = chatForm.querySelector('button');

    // --- State Variables ---
    let queryCount = 0;
    const chatLimit = Math.floor(Math.random() * 3) + 4; // Ends on query 4, 5, or 6

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

    // Helper function to decode HTML entities (like &quot; or &#039;)
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
            await fetchRandomQuestion();
        }
    }

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
     * API Function 2: Fetches a random question from the Open Trivia DB
     */
    async function fetchRandomQuestion() {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=1');
            if (!response.ok) throw new Error(`API returned status ${response.status}`);
            
            const data = await response.json();
            const questionText = decodeHtml(data.results[0].question);
            
            appendMessageAsText(questionText, 'bot');
            setTimeout(() => {
                appendSourceMessage(`Category: ${data.results[0].category}`, getRandomLink());
            }, 600);

        } catch (error) {
            console.error('Trivia API failed:', error);
            appendMessageAsText("My question-generator is on strike. Is a hotdog a sandwich? Debate.", 'bot');
        }
    }

    /**
     * REVISED - API Function 3: Fetches a random activity from the Bored API
     */
    async function endChatSession() {
        try {
            // NEW API URL:
            const response = await fetch('https://www.boredapi.com/api/activity');
            if (!response.ok) throw new Error(`API returned status ${response.status}`);

            const data = await response.json();
            
            // NEW: Build an excuse from the activity
            const excuseText = `SESSION TERMINATED. I have to go... ${data.activity}.`; 

            appendMessageAsText(excuseText, 'bot');
            setTimeout(() => {
                // NEW: Use the activity 'type' as the source
                appendSourceMessage(`Source: My "${data.type}" to-do list`, getRandomLink());
            }, 600);

        } catch (error) {
            console.error('Bored API failed:', error);
            // NEW: Updated fallback message
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
        messageDiv.classList.add('bot-source-message');
        messageDiv.innerHTML = `Source: <a href="${sourceLink}" target="_blank" rel="noopener noreferrer">${decodeHtml(sourceText)}</a>`;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // --- Utility Functions (Typing Indicator) ---

    function showTypingIndicator() {
        if (document.getElementById('typing-indicator')) return;
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.textContent = 'Processing...';
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            chatWindow.removeChild(typingDiv);
        }
    }
});
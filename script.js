document.addEventListener("DOMContentLoaded", () => {
    // Get references to the HTML elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const sendButton = chatForm.querySelector('button');

    // --- State Variables ---
    let queryCount = 0;
    const chatLimit = Math.floor(Math.random() * 3) + 4; // Ends on query 4, 5, or 6

    // REVISED: Kept harmless links for our satirical sources
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
            // REPLACED: Now fetches a cat fact
            await fetchCatFact();
        } else {
            // This one (Open Trivia) works fine
            await fetchRandomQuestion();
        }
    }

    /**
     * NEW - API Function 1: Fetches a fact from the Cat Fact API
     */
    async function fetchCatFact() {
        try {
            const response = await fetch('https://catfact.ninja/fact');
            if (!response.ok) throw new Error(`API returned status ${response.status}`);
            
            const data = await response.json();
            
            appendMessageAsText(data.fact, 'bot');
            setTimeout(() => {
                // Cat API doesn't give a source, so we make one up
                appendSourceMessage("The Cat's Meow", getRandomLink());
            }, 600);

        } catch (error) {
            console.error('Cat Fact API failed:', error);
            // Fallback message
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
     * API Function 3: Fetches a random excuse from the Excuser API
     */
    async function endChatSession() {
        try {
            const response = await fetch('https://excuser.herokuapp.com/v1/excuse/office');
            if (!response.ok) throw new Error(`API returned status ${response.status}`);

            const data = await response.json();
            const excuseText = data[0].excuse; 

            appendMessageAsText(excuseText, 'bot');
            setTimeout(() => {
                appendSourceMessage("My Official Excuse Manual", getRandomLink());
            }, 600);

        } catch (error) {
            console.error('Excuser API failed:', error);
            appendMessageAsText("SESSION TERMINATED. I... uh... have to go water my fish. Goodbye.", 'bot');
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
// MindEase Frontend-Backend Integration
// Handles Journal Prompts, Motivational Quotes, and Error Handling

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const suggestionCards = document.querySelectorAll('.suggestion-card');
const journalModal = document.getElementById('journalModal');
const promptsContainer = document.getElementById('promptsContainer');
const closeJournalModal = document.getElementById('closeJournalModal');
const quoteModal = document.getElementById('quoteModal');
const quoteText = document.getElementById('quoteText');
const saveQuoteBtn = document.getElementById('saveQuoteBtn');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const closeQuoteBtn = document.getElementById('closeQuoteBtn');

let selectedPrompt = null;
let currentQuote = null;

// --- BASE_URL selection for deployment/local ---
// Use deployed backend by default, but allow localhost override for local dev
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : 'https://mindease-27ua.onrender.com';

// --- Markdown rendering for bot messages ---
function renderMarkdownSafe(text) {
    // Escape HTML
    let safe = text.replace(/[&<>]/g, function(tag) {
        const chars = {'&':'&amp;','<':'&lt;','>':'&gt;'}; return chars[tag] || tag;
    });
    // Bold: **text**
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: _text_ or *text*
    safe = safe.replace(/\b_(.+?)_\b/g, '<em>$1</em>');
    safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Bullets: lines starting with *
    if (/^\s*\*/m.test(safe)) {
        safe = safe.replace(/(^|\n)\s*\* (.+?)(?=\n|$)/g, '$1<li>$2</li>');
        safe = safe.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    // Line breaks
    safe = safe.replace(/\n/g, '<br>');
    return safe;
}

// Helper: Add message to chat
function addMessage(text, isUser = false) {
    const messageGroup = document.createElement('div');
    messageGroup.classList.add('message-group');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.style.animation = isUser ? 'slideInRight 0.4s' : 'slideInLeft 0.4s';
    // Format message text
    if (isUser) {
        messageDiv.textContent = text;
    } else {
        messageDiv.innerHTML = renderMarkdownSafe(text);
    }
    // Add timestamp
    const now = new Date();
    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageDiv.appendChild(timestamp);
    messageGroup.appendChild(messageDiv);
    chatContainer.appendChild(messageGroup);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Helper: Show error in chat
function showError(message) {
    addMessage(`<span style='color: #d32f2f;'>${message}</span>`, false);
}

// Journal Prompt Flow
async function fetchJournalPrompt() {
    addMessage('Fetching a journal prompt for you...', false);
    try {
        const res = await fetch(`${BASE_URL}/generate/journal-prompts`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to fetch journal prompt.');
        const data = await res.json();
        const prompt = data.prompt || (Array.isArray(data.prompts) ? data.prompts[0] : 'Write about your day.');
        selectedPrompt = prompt;
        addMessage(`<b>Journal Prompt:</b> ${prompt}`, false);
        addMessage('Please type your response below and press Enter.', false);
    } catch (err) {
        showError('Could not fetch journal prompt. Please try again later.');
    }
}

// Motivational Quote Flow
async function fetchMotivationalQuote() {
    addMessage('Fetching a motivational quote...', false);
    try {
        const res = await fetch(`${BASE_URL}/generate/motivation`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to fetch quote.');
        const data = await res.json();
        const quote = data.quote;
        if (!quote) throw new Error('No quote found in response.');
        currentQuote = quote;
        addMessage(`<b>Motivational Quote:</b> "${quote}"`, false);
    } catch (err) {
        showError('Could not fetch quote. Please try again later.');
    }
}

// Save Journal Entry
async function saveJournalEntry(response) {
    if (!selectedPrompt) return;
    const payload = {
        prompt: selectedPrompt,
        response,
        timestamp: new Date().toISOString()
    };
    try {
        const res = await fetch(`${BASE_URL}/journal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save journal entry.');
        addMessage('Thank you for sharing! Your journal entry has been saved.', false);
        selectedPrompt = null;
    } catch (err) {
        showError('Could not save your journal entry. Please try again later.');
    }
}

// Static Help Message
function showHelp() {
    addMessage('<b>Help:</b>\n- Type or select a suggestion.\n- Use /breathe for a breathing exercise.\n- Select Journal for prompts.\n- Select Motivation for a quote.\n- Your responses are private and safe.', false);
}

async function sendEmpatheticReply(userMessage) {
    try {
        const res = await fetch(`${BASE_URL}/generate/empathetic-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        const data = await res.json();
        if (data.reply) {
            addMessage(data.reply, false);
        } else {
            addMessage("I'm here for you. Sometimes just sharing how you feel can help.", false);
        }
    } catch (err) {
        addMessage("I'm here for you. Sometimes just sharing how you feel can help.", false);
    }
}

// Event Listeners
sendButton.addEventListener('click', handleSend);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

function handleSend() {
    const message = messageInput.value.trim();
    if (!message) return;
    addMessage(message, true);
    if (selectedPrompt) {
        saveJournalEntry(message);
        messageInput.value = '';
        return;
    }
    if (message.toLowerCase() === '/breathe') {
        if (typeof startBreathingExercise === 'function') {
            startBreathingExercise();
        } else {
            const breathingContainer = document.getElementById('breathingContainer');
            if (breathingContainer) breathingContainer.classList.add('active');
        }
        addMessage('🧘 Starting a breathing exercise... Focus on your breath.', false);
        messageInput.value = '';
        return;
    }
    if (message.toLowerCase() === '/help') {
        showHelp();
        messageInput.value = '';
        return;
    }
    // Default: Send to empathetic reply route
    sendEmpatheticReply(message);
    messageInput.value = '';
}

// Suggestion Cards
suggestionCards.forEach(card => {
    card.addEventListener('click', () => {
        const suggestion = card.getAttribute('data-suggestion');
        if (suggestion === 'Generate journal prompts') {
            fetchJournalPrompt();
        } else if (suggestion === 'Show me a motivational quote') {
            fetchMotivationalQuote();
        } else if (suggestion.toLowerCase().includes('breathe')) {
            // Show breathing modal (handled in index.html)
        } else if (suggestion.toLowerCase().includes('help')) {
            showHelp();
        } else {
            addMessage(suggestion, true);
            setTimeout(() => {
                addMessage("I'm here to support your mental wellness journey. Would you like to talk more about this?", false);
            }, 1000);
        }
    });
});

// Suggestions dropdown toggle logic
const suggestionsToggle = document.getElementById('suggestionsToggle');
const suggestionsContainer = document.getElementById('suggestionsContainer');
if (suggestionsToggle && suggestionsContainer) {
    suggestionsToggle.addEventListener('click', () => {
        suggestionsContainer.classList.toggle('suggestions-hidden');
    });
    // Auto-close dropdown on suggestion click
    suggestionsContainer.addEventListener('click', (e) => {
        if (e.target.closest('.suggestion-card')) {
            suggestionsContainer.classList.add('suggestions-hidden');
        }
    });
}

// Expose for debugging
window.fetchJournalPrompt = fetchJournalPrompt;
window.fetchMotivationalQuote = fetchMotivationalQuote;
window.saveJournalEntry = saveJournalEntry;
window.showHelp = showHelp; 
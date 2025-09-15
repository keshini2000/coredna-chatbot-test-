class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loading = document.getElementById('loading');
        
        this.sessionId = this.generateSessionId();
        this.initializeEventListeners();
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Suggestion buttons
        this.messagesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const suggestion = e.target.getAttribute('data-suggestion');
                this.messageInput.value = suggestion;
                this.sendMessage();
            }
        });

        // Auto-focus on input
        this.messageInput.focus();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Clear input and disable send button
        this.messageInput.value = '';
        this.sendButton.disabled = true;
        
        // Add user message to chat
        this.addUserMessage(message);
        
        // Show loading
        this.showLoading();

        try {
            // Send to API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Hide loading and add bot response
            this.hideLoading();
            this.addBotMessage(data);
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideLoading();
            this.addErrorMessage('Sorry, I encountered an error. Please try again.');
        } finally {
            // Re-enable send button
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }

    addUserMessage(message) {
        const messageElement = this.createMessageElement('user', message);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(response) {
        const messageElement = this.createBotMessageElement(response);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addErrorMessage(message) {
        const messageElement = this.createMessageElement('bot', message);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    createMessageElement(type, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatarContent = type === 'user' ? '👤' : `
            <div class="robot-antenna"></div>
            <div class="robot-face"></div>
        `;
        const avatarClass = type === 'user' ? 'user-avatar' : 'bot-avatar';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="${avatarClass}">${avatarContent}</div>
                <div class="message-text">
                    <p>${this.escapeHtml(message)}</p>
                </div>
            </div>
        `;
        
        return messageDiv;
    }

    createBotMessageElement(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        let content = `<p>${this.escapeHtml(response.message)}</p>`;
        
        // Handle different response types
        switch (response.type) {
            case 'greeting':
            case 'help':
                if (response.suggestions) {
                    content += this.createSuggestions(response.suggestions);
                }
                break;
                
            case 'pricing':
                content += this.createPricingContent(response.content);
                break;
                
            case 'features':
                content += this.createFeaturesContent(response.content);
                break;
                
            case 'search':
                content += this.createSearchContent(response);
                break;
                
            case 'no_results':
                if (response.suggestions) {
                    content += this.createSuggestions(response.suggestions);
                }
                break;
        }
        
        // Add source link if available
        if (response.mainResult && response.mainResult.source) {
            content += `
                <div class="source-link">
                    <small>Source: <a href="${response.mainResult.source}" target="_blank">CoreDNA</a></small>
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="bot-avatar">
                    <div class="robot-antenna"></div>
                    <div class="robot-face"></div>
                </div>
                <div class="message-text">${content}</div>
            </div>
        `;
        
        return messageDiv;
    }

    createSuggestions(suggestions) {
        const suggestionButtons = suggestions.map(suggestion => 
            `<button class="suggestion-btn" data-suggestion="${this.escapeHtml(suggestion)}">${this.escapeHtml(suggestion)}</button>`
        ).join('');
        
        return `<div class="suggestions">${suggestionButtons}</div>`;
    }

    createPricingContent(content) {
        if (!content) return '';
        
        let html = '';
        
        if (content.plans && content.plans.length > 0) {
            html += '<div class="pricing-info"><ul class="pricing-plans">';
            content.plans.forEach(plan => {
                html += `<li>${this.escapeHtml(plan)}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (content.highlights && content.highlights.length > 0) {
            html += '<div class="pricing-info"><ul class="highlights">';
            content.highlights.forEach(highlight => {
                html += `<li>${this.escapeHtml(highlight)}</li>`;
            });
            html += '</ul></div>';
        }
        
        return html;
    }

    createFeaturesContent(content) {
        if (!content) return '';
        
        let html = '';
        
        if (content.highlights && content.highlights.length > 0) {
            html += '<div class="features-info"><ul class="highlights">';
            content.highlights.forEach(highlight => {
                html += `<li>${this.escapeHtml(highlight)}</li>`;
            });
            html += '</ul></div>';
        }
        
        return html;
    }

    createSearchContent(response) {
        let html = '';
        
        if (response.mainResult && response.mainResult.relevantInfo) {
            html += '<div class="search-results">';
            response.mainResult.relevantInfo.forEach(info => {
                html += `<p>• ${this.escapeHtml(info)}</p>`;
            });
            html += '</div>';
        }
        
        if (response.suggestions) {
            html += this.createSuggestions(response.suggestions);
        }
        
        return html;
    }

    showLoading() {
        this.loading.style.display = 'flex';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
});
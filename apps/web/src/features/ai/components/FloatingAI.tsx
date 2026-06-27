import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const FloatingAI = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('ai.greeting') || 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lifeboard_access_token')}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.data?.response || data.message || 'I\'m sorry, I couldn\'t process that.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I\'m sorry, I encountered an error. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: getLocalResponse(userMessage) }]);
    } finally {
      setLoading(false);
    }
  };

  const getLocalResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('task') || q.includes('todo')) return 'You can manage tasks on the Today page. Use the timeline to add and organize your daily tasks.';
    if (q.includes('habit')) return 'Track your habits on the Habits page. You can create new habits in the Workspace > Habit Management section.';
    if (q.includes('goal')) return 'Set and track your goals on the Goals page. Create new goals and milestones there.';
    if (q.includes('expense') || q.includes('money') || q.includes('finance')) return 'Manage your finances on the Finance page. You can add expenses, income, and track your budget.';
    if (q.includes('journal') || q.includes('diary')) return 'Write your daily journal on the Journal page. Each day gets its own entry automatically.';
    if (q.includes('project')) return 'Manage your projects on the Projects page. You can create projects and add tasks to them.';
    if (q.includes('plan') || q.includes('week') || q.includes('schedule')) return 'Use the Week Planner to organize your week with time blocks.';
    if (q.includes('category')) return 'You can manage all categories in Workspace > Categories. Categories are used across the app for organizing your data.';
    if (q.includes('profile') || q.includes('settings')) return 'View and edit your profile in Workspace > Profile. You can change your theme, language, and other preferences there.';
    if (q.includes('help')) return 'I can help you with tasks, habits, goals, expenses, journal, projects, and more. Just ask me anything!';
    if (q.includes('hello') || q.includes('hi')) return 'Hello! How can I assist you with LifeBoard today?';
    return 'I\'m your LifeBoard assistant. I can help you navigate the app, understand features, or provide quick tips. Try asking me about tasks, habits, goals, or finance!';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label={t('ai.floatingButton')}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 flex w-80 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl sm:w-96 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('ai.title')}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Online</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto rounded-lg p-1 hover:bg-[var(--secondary)]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    msg.role === 'user' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]'
                  }`}>
                    {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'bg-[var(--secondary)]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)]">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="rounded-2xl bg-[var(--secondary)] px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.placeholder') || 'Ask me anything...'}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--foreground)]"
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--background)] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

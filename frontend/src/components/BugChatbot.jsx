import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, CheckCircle, RefreshCw, Bot, User, Lightbulb } from 'lucide-react';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are BugBot, an expert software development assistant. 
Your job is to help developers and managers write high-quality reports and tasks.

Depending on the mode, you must:

### MODE: BUG
Generate a structured bug report suggestion. 
Use placeholders like "[Specify Steps]" if info is missing.
JSON structure:
\`\`\`json
{
  "type": "bug",
  "title": "Short bug title",
  "description": "**Steps to Reproduce:**\\n1. [Step]\\n\\n**Expected:**\\n[Result]\\n\\n**Actual:**\\n[Result]",
  "severity": "minor|major|critical|blocker",
  "category": "UI|API|Auth|Performance|Database|Security|Other",
  "severity_reason": "Reason for severity"
}
\`\`\`

### MODE: TASK (Sprint Board)
Generate a structured sprint task suggestion. 
Focus on clear requirements and acceptance criteria.
JSON structure:
\`\`\`json
{
  "type": "task",
  "title": "Clear task title",
  "description": "**Goal:**\\n[Goal]\\n\\n**Acceptance Criteria:**\\n- [Crit 1]\\n- [Crit 2]\\n\\n**Technical Notes:**\\n[Notes]",
  "priority": "low|medium|high|urgent",
  "category": "Frontend|Backend|Design|Docs|Testing|DevOps",
  "priority_reason": "Reason for priority"
}
\`\`\`

ALWAYS respond with the JSON block. Be friendly and professional.`;

function parseAIResponse(text) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
  } catch (e) {
    // Not a JSON response — it's a follow-up question
  }
  return null;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

const STARTER_PROMPTS = [
  "Login button doesn't work on mobile",
  "Page crashes when I submit the form",
  "Data isn't saving after clicking update",
  "Wrong error message is displayed",
];

export default function BugChatbot({ onClose, onApplySuggestion, formData, type = 'bug' }) {
  const isTaskMode = type === 'task';
  const botName = isTaskMode ? 'TaskBot' : 'BugBot';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi! I'm **${botName}** 🤖 Describe the ${isTaskMode ? 'task' : 'bug'} in plain English and I'll help you write it perfectly.`,
      parsed: null,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedIndex, setAppliedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buildHistory = () => {
    const history = [];
    // Skip the first greeting message
    for (const msg of messages.slice(1)) {
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    }
    return history;
  };

  const sendMessage = async (messageText) => {
    const text = messageText ?? input.trim();
    if (!text || isLoading) return;
    setInput('');
    setError('');

    // Add user message
    const userMsg = { role: 'user', text, parsed: null };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Build context from current form
    const contextNote = formData.title || formData.category
      ? `\n\n[Current form context — Type: "${type}", Title: "${formData.title || 'empty'}", Category: "${formData.category || 'none'}"]`
      : `\n\n[Mode: "${type}"]`;

    try {
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error('NO_API_KEY');
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `SYSTEM INSTRUCTIONS: ${SYSTEM_PROMPT}` }] },
            { role: 'model', parts: [{ text: "Understood. I am now BugBot. How can I help you today?" }] },
            ...buildHistory(),
            { role: 'user', parts: [{ text: text + contextNote }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `API Error ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const parsed = parseAIResponse(aiText);

      setMessages(prev => [...prev, { role: 'assistant', text: aiText, parsed }]);
    } catch (err) {
      if (err.message === 'NO_API_KEY') {
        setError('⚠️ Gemini API key not set. Add VITE_GEMINI_API_KEY to your frontend/.env file and restart the dev server.');
      } else {
        setError(`Failed to get AI response: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (parsed, index) => {
    onApplySuggestion({
      title: parsed.title || '',
      description: parsed.description || '',
      severity: parsed.severity || undefined,
      priority: parsed.priority || undefined,
      category: parsed.category || '',
    });
    setAppliedIndex(index);
  };

  const handleReset = () => {
    setMessages([{
      role: 'assistant',
      text: `Hi! I'm **${botName}** 🤖 Describe the ${isTaskMode ? 'task' : 'bug'} in plain English and I'll help you write it perfectly.`,
      parsed: null,
    }]);
    setInput('');
    setError('');
    setAppliedIndex(null);
  };

  // Render markdown-lite: bold, italic, newlines, bullet list
  const renderText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Numbered list
      if (/^\d+\./.test(line.trim())) {
        return <div key={i} className="ml-3" dangerouslySetInnerHTML={{ __html: line }} />;
      }
      // Bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return <div key={i} className="ml-3" dangerouslySetInnerHTML={{ __html: '• ' + line.trim().slice(2) }} />;
      }
      // Headings (** prefix)
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        return <div key={i} className="font-bold mt-1" dangerouslySetInnerHTML={{ __html: line }} />;
      }
      if (line === '') return <div key={i} className="h-1" />;
      return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  const severityColors = {
    blocker: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-orange-100 text-orange-700 border-orange-200',
    major: 'bg-amber-100 text-amber-700 border-amber-200',
    minor: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] rounded-r-[30px] border-l border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-tr-[30px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">{botName}</p>
            <p className="text-[10px] text-purple-200">AI {isTaskMode ? 'Sprint' : 'Bug'} Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Start over"
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-3.5 h-3.5 text-white" />
                : <User className="w-3.5 h-3.5 text-white" />
              }
            </div>

            <div className="flex flex-col gap-2 max-w-[85%]">
              {/* Main bubble */}
              <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed text-gray-700 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white rounded-tl-sm border border-gray-100'
              }`}>
                {msg.role === 'user' ? msg.text : renderText(msg.text.replace(/```json[\s\S]*?```/g, '').trim())}
              </div>

              {/* Structured suggestion card */}
              {msg.parsed && (
                <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500">
                      Suggested {isTaskMode ? 'Task' : 'Bug Report'}
                    </span>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Title</p>
                    <p className="text-xs font-semibold text-gray-800">{msg.parsed.title}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                      {isTaskMode ? 'Description/Criteria' : 'Description Preview'}
                    </p>
                    <p className="text-[11px] text-gray-600 line-clamp-3 leading-relaxed">{msg.parsed.description?.replace(/\*\*/g, '').split('\n')[0]}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {msg.parsed.severity && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColors[msg.parsed.severity] || severityColors.major}`}>
                        {msg.parsed.severity}
                      </span>
                    )}
                    {msg.parsed.priority && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColors[msg.parsed.priority] || severityColors.major}`}>
                        {msg.parsed.priority}
                      </span>
                    )}
                    {msg.parsed.category && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200">
                        {msg.parsed.category}
                      </span>
                    )}
                    {(msg.parsed.severity_reason || msg.parsed.priority_reason) && (
                      <span className="text-[9px] text-gray-400 italic">{msg.parsed.severity_reason || msg.parsed.priority_reason}</span>
                    )}
                  </div>

                  {appliedIndex === idx ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Applied to form!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(msg.parsed, idx)}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-purple-200"
                    >
                      ✦ Use This Suggestion
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter prompts — only show at start */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Try an example</p>
          <div className="flex flex-col gap-1.5">
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-left text-xs text-purple-600 bg-purple-50 border border-purple-100 hover:bg-purple-100 rounded-xl px-3 py-2 transition-all hover:scale-[1.01] active:scale-95 font-medium"
              >
                💬 {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 rounded-br-[30px]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe the bug... (Enter to send)"
            className="flex-1 bg-[#f3f5f9] rounded-2xl px-4 py-2.5 text-xs text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all leading-relaxed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-200 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
        <p className="text-[9px] text-gray-300 mt-1.5 ml-1">Shift+Enter for new line • Enter to send</p>
      </div>
    </div>
  );
}

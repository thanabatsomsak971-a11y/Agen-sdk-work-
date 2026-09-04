import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatSurface({ apiUrl }: { apiUrl: string }): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] md:h-[calc(100dvh-80px)]">
      {/* Message list */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-carbon-700 p-8 text-center">
            <div className="text-3xl opacity-30">💬</div>
            <p className="mt-3 text-sm text-chrome-600">
              ส่งข้อความเพื่อเริ่มคุยกับ Claude
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm',
                msg.role === 'user'
                  ? 'bg-ice-500/10 text-ice-200'
                  : 'bg-carbon-800 text-chrome-300',
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-carbon-800 px-4 py-2.5 text-sm text-chrome-600">
              <span className="animate-pulse">Claude กำลังคิด...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            ⚠ {error}
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-carbon-800 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="พิมพ์ข้อความ..."
          disabled={loading}
          className="flex-1 rounded-lg border border-carbon-700 bg-carbon-950 px-3 py-2 text-sm text-chrome-300 outline-none focus:border-ice-500 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-lg bg-ice-500/20 px-4 py-2 text-sm font-medium text-ice-300 hover:bg-ice-500/30 disabled:opacity-30"
        >
          ส่ง
        </button>
      </div>
    </div>
  );
}

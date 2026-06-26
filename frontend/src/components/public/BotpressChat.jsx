import { useMemo, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';

const quickActions = [
  'How do I report an issue?',
  'What are NagarSeva features?',
  'How does the leaderboard work?',
  'Citizen vs municipal portal',
];

const appFacts = [
  'NagarSeva supports image and video issue reporting with GPS capture.',
  'Gemini-based civic triage helps classify category, severity, urgency, and suggested department.',
  'Citizens can validate issues through community voting and track resolution status.',
  'Municipal users get a scoped queue with assignment, due dates, escalation, and logs.',
  'Leaderboard impact is driven by reports that the municipality actually resolves.',
];

const buildAssistantReply = (input) => {
  const message = String(input || '').toLowerCase().trim();

  if (!message) {
    return `I can help with reporting issues, community voting, municipal workflow, portals, and leaderboard logic.\n\n${appFacts.join('\n')}`;
  }

  if (/(hi|hello|hey|namaste)\b/.test(message)) {
    return `Hello. I’m Luna, your NagarSeva assistant.\n\nI can help with:\n- reporting an issue\n- tracking issue status\n- community voting\n- citizen vs municipal portal flow\n- leaderboard and municipal workflow`;
  }

  if (/(report|upload|post issue|create issue|how do i report)/.test(message)) {
    return `To report an issue:\n1. Open the Report page.\n2. Upload an image or video.\n3. Add a short description.\n4. Allow location access for GPS tagging.\n5. Submit the issue for AI triage.\n\nThe system stores the report, maps it, and sends it into community and municipal workflows.`;
  }

  if (/(feature|features|what is nagarseva|what does nagarseva do)/.test(message)) {
    return `NagarSeva core features:\n- image and video issue reporting\n- AI-powered categorization\n- GPS mapping\n- community validation\n- real-time issue tracking\n- municipal assignment and escalation\n- impact dashboards\n- citizen leaderboard based on resolved issues`;
  }

  if (/(leaderboard|ranking|rank|points|score)/.test(message)) {
    return `The leaderboard is tied to real civic impact.\n\nA citizen moves up when:\n- they post valid issues\n- their issues receive community validation\n- their issues are marked resolved by the municipality\n\nResolved municipal closure matters more than simple posting.`;
  }

  if (/(municipal|municipality|admin|officer|assignment|escalat)/.test(message)) {
    return `Municipal users work inside the AI Civic Action Center.\n\nThey can:\n- review scoped issues by jurisdiction and category\n- assign issues to officers\n- set due dates\n- escalate blocked cases\n- change status\n- review logs and impact analytics`;
  }

  if (/(citizen|portal|difference|two portals|citizen vs municipal)/.test(message)) {
    return `NagarSeva has two separate portals.\n\nCitizen portal:\n- report issues\n- validate nearby issues\n- track personal reports\n- appear on the impact leaderboard\n\nMunicipal portal:\n- review scoped queue\n- assign officers\n- escalate and resolve issues\n- monitor logs and dashboards`;
  }

  if (/(track|tracking|status|follow up|resolution)/.test(message)) {
    return `Issue tracking follows a status lifecycle such as Open, Pending, In Progress, and Resolved.\n\nCitizens can monitor progress from the dashboard and community map. Municipal users update status from the scoped queue.`;
  }

  if (/(vote|validation|community voting|verify)/.test(message)) {
    return `Community voting helps validate urgency and visibility.\n\nHigher validation can raise an issue’s priority. The voting page also highlights top validated issues and a citizen impact leaderboard.`;
  }

  return `I don’t have a narrow answer for that yet, but I can help with reporting, portals, municipal workflow, community voting, issue tracking, and leaderboard logic.\n\nTry one of these:\n- How do I report an issue?\n- What are NagarSeva features?\n- Citizen vs municipal portal\n- How does the leaderboard work?`;
};

const MessageBubble = ({ role, text }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
        role === 'user'
          ? 'bg-emerald-600 text-white'
          : 'border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100'
      }`}
    >
      {text}
    </div>
  </div>
);

export default function BotpressChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text:
        'Luna, your NagarSeva assistant.\n\nI can help you understand reporting, tracking, community voting, the two portals, and municipal workflow.',
    },
  ]);

  const canSend = input.trim().length > 0;

  const suggestions = useMemo(() => quickActions, []);

  const submitMessage = (rawText) => {
    const text = String(rawText || input).trim();
    if (!text) return;

    const reply = buildAssistantReply(text);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'assistant', text: reply },
    ]);
    setInput('');
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-[60] w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-emerald-200 bg-white shadow-2xl dark:border-emerald-900/30 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 bg-emerald-50 px-4 py-4 dark:border-zinc-800 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-zinc-950 dark:text-white">Luna</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">NagarSeva Assistant</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-zinc-500 hover:bg-white hover:text-zinc-900 dark:hover:bg-slate-900 dark:hover:text-white"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto bg-zinc-50 px-4 py-4 dark:bg-slate-900/40">
            {messages.map((message, index) => (
              <MessageBubble key={`${message.role}-${index}`} role={message.role} text={message.text} />
            ))}
          </div>

          <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitMessage(suggestion)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitMessage();
                }}
                placeholder="Ask Luna about NagarSeva..."
                className="h-11 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="button"
                onClick={() => submitMessage()}
                disabled={!canSend}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-4 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:scale-105 hover:bg-emerald-700"
        aria-label="Open Luna assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}

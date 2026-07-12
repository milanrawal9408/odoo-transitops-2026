import { useState, useRef, useEffect } from "react";
import API from "../../services/api";
import { FaRobot, FaPaperPlane, FaSpinner, FaRegLightbulb, FaRegTrashAlt } from "react-icons/fa";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! I am **TransitOps AI**, your virtual ERP fleet assistant. Ask me questions about today's trips, vehicle maintenance logs, top drivers, fuel expenditures, and overall fleet statuses.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionPrompts = [
    "Fleet summary",
    "Which vehicles are under maintenance?",
    "Show today's trips",
    "Vehicles with insurance expiring soon",
    "Fuel expenses",
    "Which driver completed the most trips?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Append user message
    const updatedMessages = [...messages, { role: "user", text: query }];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      // Map history to the format expected by the backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await API.post("/ai/chat", {
        message: query,
        history: historyPayload,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", text: res.data.reply || "No reply generated." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ **Error**: ${err.response?.data?.message || "Failed to contact Gemini API. Please make sure the API key is configured correctly."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "model",
        text: "Conversation cleared. How can I help you manage your fleet operations today?",
      },
    ]);
  };

  // Safe formatting helper to render basic markdown constructs (bold, lists, backticks)
  const formatMessageText = (text) => {
    if (!text) return "";
    
    // Escape standard html tags to prevent XSS
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace bold formatting: **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace code highlights: `code`
    escaped = escaped.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-rose-600 px-1 py-0.5 rounded text-xs">$1</code>');

    // Handle line breaks and lists
    const lines = escaped.split("\n");
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    const result = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Unordered list items: starting with '- ' or '* '
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul class="list-disc pl-5 my-2 space-y-1">');
          inList = true;
          listType = "ul";
        }
        result.push(`<li>${trimmed.substring(2)}</li>`);
        return;
      }

      // Ordered list items: starting with numbers '1. ' etc.
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inList || listType !== "ol") {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol class="list-decimal pl-5 my-2 space-y-1">');
          inList = true;
          listType = "ol";
        }
        result.push(`<li>${trimmed.replace(/^\d+\.\s/, "")}</li>`);
        return;
      }

      // Close open list if we hit a regular paragraph
      if (inList && trimmed === "") {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
        return;
      }

      // Normal paragraph
      if (trimmed !== "") {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        result.push(`<p class="mb-2 last:mb-0">${trimmed}</p>`);
      }
    });

    if (inList) {
      result.push(`</${listType}>`);
    }

    return result.join("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaRobot className="text-blue-500" /> AI Fleet Assistant
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Query real-time logs, compute fleet analytics, and check compliance status
          </p>
        </div>
        <button
          onClick={handleClearHistory}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <FaRegTrashAlt /> Clear Thread
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Chat Thread Panel */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden h-full">
          {/* Thread messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                    m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {m.role === "user" ? "U" : <FaRobot />}
                </div>
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed border ${
                    m.role === "user"
                      ? "bg-blue-600 text-white border-blue-500 rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none"
                  }`}
                >
                  <div
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessageText(m.text) }}
                  />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FaRobot />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-2 text-slate-500">
                  <FaSpinner className="animate-spin text-blue-500" />
                  <span>TransitOps AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form input field */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me e.g. 'Which vehicles are available?' or 'Fuel expenses'..."
                className="flex-1 px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-blue-500/25 disabled:bg-slate-300 disabled:shadow-none"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </form>
          </div>
        </div>

        {/* Suggestion Prompts Panel */}
        <div className="hidden lg:block lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FaRegLightbulb className="text-amber-500" /> Suggestion Queries
          </h3>
          <p className="text-xs text-slate-400">
            Click on any query below to directly get real-time ERP analytics:
          </p>
          <div className="flex flex-col gap-2.5">
            {suggestionPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendMessage(p)}
                disabled={loading}
                className="text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/10 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;

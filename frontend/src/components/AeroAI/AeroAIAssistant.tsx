import React, { useState, useEffect, useRef } from 'react';
import { AircraftTelemetry, AICopilotMessage } from '../../types';
import { aiAssistantService } from '../../services/aiAssistantService';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Key, 
  CheckCircle, 
  X 
} from 'lucide-react';

interface AeroAIAssistantProps {
  activeAircraft: AircraftTelemetry;
}

export const AeroAIAssistant: React.FC<AeroAIAssistantProps> = ({ activeAircraft }) => {
  const [messages, setMessages] = useState<AICopilotMessage[]>(aiAssistantService.getMessages());
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(aiAssistantService.getApiKey());
  const [selectedProvider, setSelectedProvider] = useState<'OPENAI' | 'GEMINI'>(aiAssistantService.getProvider());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: AICopilotMessage = {
      id: `USER-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const reply = await aiAssistantService.processQuery(textToSend, activeAircraft);
      setMessages(prev => [...prev, reply]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    aiAssistantService.setApiKey(apiKeyInput, selectedProvider);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowKeyModal(false);
    }, 800);
  };

  const quickPrompts = [
    { label: 'Analyze EGT Degradation', query: 'Analyze Engine 2 EGT exceedance, vibration, and borescope requirements for AV-304.' },
    { label: 'Optimal Diversion Runways', query: 'Calculate optimal emergency diversion airports and runway friction index.' },
    { label: 'AI Storm Reroute Corridor', query: 'Brief me on the AI Route Optimization Corridor around the Bay of Bengal supercell.' },
    { label: 'Hydraulic Circuit B Leak', query: 'What is the QRH procedure for Hydraulic System B pressure decay and PTU status?' }
  ];

  const hasCustomKey = !!aiAssistantService.getApiKey();

  return (
    <div className="flex flex-col h-[700px] rounded-2xl glass-panel border border-purple-500/30 overflow-hidden font-mono select-none">
      {/* AI Assistant Header */}
      <div className="p-4 bg-aerospace-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-hud-glow">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-white">
                AEROAI COPILOT & AVIATION OPERATIONS INTELLIGENCE
              </h3>
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                hasCustomKey ? 'bg-hud-emerald/20 text-hud-emerald border border-hud-emerald/40' : 'bg-purple-900/40 text-purple-300 border border-purple-700/40'
              }`}>
                {hasCustomKey ? '● LIVE LLM ACTIVE' : '● AEROSPACE EXPERT ENGINE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Trained on Boeing AMM, Airbus FCOM, ICAO Annex 13 & Real-Time Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-aerospace-900 border border-slate-700 hover:border-purple-500 text-xs text-slate-300 hover:text-white transition-all"
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>{hasCustomKey ? 'API Key Configured' : 'Enter API Key'}</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-hud-glow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed ${
                  isUser
                    ? 'bg-hud-cyan/20 border border-hud-cyan/40 text-white rounded-tr-none'
                    : 'bg-aerospace-900/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-800/60 pb-1">
                  <span className="font-bold text-hud-cyan">{isUser ? 'FLIGHT CONTROLLER' : 'AEROAI COPILOT'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line font-mono text-slate-200 text-xs leading-relaxed">
                  {msg.text}
                </div>

                {msg.telemetryContext && (
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-3">
                    {msg.telemetryContext.faultCode && (
                      <span className="text-hud-amber">FAULT: {msg.telemetryContext.faultCode}</span>
                    )}
                    {msg.telemetryContext.ammReference && (
                      <span className="text-hud-cyan">REF: {msg.telemetryContext.ammReference}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-3 text-xs text-purple-300 font-mono animate-pulse p-2">
            <Bot className="w-4 h-4 animate-spin" />
            <span>Analyzing flight telemetry & computing aerodynamic models...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-aerospace-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 uppercase font-bold shrink-0">QUICK QUERIES:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="px-2.5 py-1 rounded-lg bg-aerospace-900 border border-slate-800 hover:border-purple-500 text-slate-300 hover:text-white shrink-0 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-aerospace-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask AeroAI about flight telemetry, engine health, AMM maintenance actions, or diversions..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 p-2.5 rounded-xl bg-aerospace-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isProcessing}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-hud-glow disabled:opacity-50 text-xs"
        >
          <Send className="w-4 h-4" />
          <span>TRANSMIT</span>
        </button>
      </form>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[3000]">
          <div className="w-full max-w-md bg-aerospace-950 border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Configure AI Copilot API Key</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your **OpenAI API Key** to enable live GPT-4o intelligent completions with real-time aircraft telemetry context.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  AI PROVIDER:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('OPENAI')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedProvider === 'OPENAI'
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-aerospace-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    OpenAI (GPT-4o)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('GEMINI')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                      selectedProvider === 'GEMINI'
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-aerospace-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Google Gemini
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  API KEY (STORED LOCALLY):
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-aerospace-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    aiAssistantService.setApiKey('');
                    setShowKeyModal(false);
                  }}
                  className="text-xs text-slate-400 hover:text-hud-crimson"
                >
                  Clear Key
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {savedSuccess ? <CheckCircle className="w-3.5 h-3.5 text-hud-emerald" /> : null}
                    <span>{savedSuccess ? 'Saved!' : 'Save Key'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFactory } from '@/context/FactoryContext';
import { Bot, X, Send, Minimize2, Maximize2, Zap, Cpu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  ts: Date;
}

// AI response engine — purely based on live sensor context
function generateAIResponse(
  query: string,
  machines: ReturnType<typeof useFactory>['machines'],
  kpis: ReturnType<typeof useFactory>['kpis'],
  alerts: ReturnType<typeof useFactory>['alerts']
): string {
  const q = query.toLowerCase();
  const boiler = machines.find(m => m.id === 'boiler')!;
  const crusher = machines.find(m => m.id === 'crusher')!;
  const centrifuge = machines.find(m => m.id === 'centrifuge')!;

  const criticals = machines.filter(m => m.status === 'critical');
  const warnings = machines.filter(m => m.status === 'warning');
  const highestRisk = [...machines].sort((a, b) => b.riskScore - a.riskScore)[0];
  const recentAlerts = alerts.slice(0, 5);

  // Failure / next fail
  if (q.includes('fail') || q.includes('next') || q.includes('predict') || q.includes('break')) {
    if (criticals.length > 0) {
      const m = criticals[0];
      return `⚠️ CRITICAL: ${m.name} is at ${m.riskScore}% risk right now.\n\nCurrent readings: Temp ${m.temp.toFixed(1)}°C | Vibration ${m.vibration.toFixed(2)} mm/s.\n\nEstimated failure window: < 2 hours if unchecked.\n\nRecommended action: Reduce load on ${m.name} immediately and schedule an emergency inspection.`;
    }
    if (warnings.length > 0) {
      return `⚡ ${highestRisk.name} has the highest failure probability at ${highestRisk.riskScore}% risk.\n\nTemp: ${highestRisk.temp.toFixed(1)}°C | Vib: ${highestRisk.vibration.toFixed(2)} mm/s.\n\nPredicted maintenance window: 6–12 hours.\n\nNo immediate shutdown required — monitor closely.`;
    }
    return `✅ All machines are currently healthy.\n\n${highestRisk.name} has the highest risk at ${highestRisk.riskScore}%, but is within safe thresholds.\n\nNo failures predicted in the next 24 hours based on current telemetry trends.`;
  }

  // Boiler specific
  if (q.includes('boiler') || q.includes('steam') || q.includes('pressure')) {
    const eta = boiler.status === 'critical' ? '< 2h' : boiler.status === 'warning' ? '6–12h' : '> 24h';
    return `🔥 Steam Boiler Status: ${boiler.status.toUpperCase()}\n\nTemp: ${boiler.temp.toFixed(1)}°C (safe < 120°C)\nVibration: ${boiler.vibration.toFixed(2)} mm/s\nRisk Score: ${boiler.riskScore}%\n\nPredicted maintenance: ${eta}\n\n${boiler.status === 'critical' ? '🚨 URGENT: Reduce steam pressure and inspect heat exchanger!' : boiler.status === 'warning' ? '⚠️ Monitor closely. Schedule inspection within 12 hours.' : '✅ Operating within normal parameters.'}`;
  }

  // Crusher specific
  if (q.includes('crusher') || q.includes('cane')) {
    const eta = crusher.status === 'critical' ? '< 2h' : crusher.status === 'warning' ? '6–12h' : '> 24h';
    return `⚙️ Cane Crusher Status: ${crusher.status.toUpperCase()}\n\nTemp: ${crusher.temp.toFixed(1)}°C\nVibration: ${crusher.vibration.toFixed(2)} mm/s\nRisk Score: ${crusher.riskScore}%\n\nPredicted maintenance: ${eta}\n\n${crusher.status === 'critical' ? '🚨 Shut down immediately and inspect roller bearings.' : crusher.status === 'warning' ? '⚠️ Vibration trending high. Check roller alignment.' : '✅ Crusher running efficiently.'}`;
  }

  // Centrifuge specific
  if (q.includes('centrifuge') || q.includes('sugar') || q.includes('crystal')) {
    const eta = centrifuge.status === 'critical' ? '< 2h' : centrifuge.status === 'warning' ? '6–12h' : '> 24h';
    return `🔄 Centrifuge Unit Status: ${centrifuge.status.toUpperCase()}\n\nTemp: ${centrifuge.temp.toFixed(1)}°C\nVibration: ${centrifuge.vibration.toFixed(2)} mm/s\nRisk Score: ${centrifuge.riskScore}%\n\nPredicted maintenance: ${eta}\n\n${centrifuge.status === 'critical' ? '🚨 Stop centrifuge. Imbalance detected — risk of basket damage.' : centrifuge.status === 'warning' ? '⚠️ Check basket balance and inspect seals.' : '✅ Centrifuge operating at optimal RPM.'}`;
  }

  // Efficiency / performance
  if (q.includes('efficiency') || q.includes('performance') || q.includes('throughput') || q.includes('production')) {
    const effLabel = kpis.plantEfficiency >= 90 ? 'Excellent' : kpis.plantEfficiency >= 80 ? 'Good' : 'Degraded';
    return `📊 Plant Performance Summary:\n\nEfficiency: ${kpis.plantEfficiency}% — ${effLabel}\nThroughput: ${kpis.throughput} t/hr\nAutomation Index: ${kpis.automationIndex}%\nDowntime Prevented: ${kpis.downtimePrevented.toFixed(1)} hrs\n\n${kpis.plantEfficiency < 85 ? '⚠️ Efficiency below target. Check ' + highestRisk.name + ' — it is dragging overall OEE.' : '✅ Plant is running at high efficiency. Maintain current operational settings.'}`;
  }

  // Cost / maintenance cost
  if (q.includes('cost') || q.includes('money') || q.includes('rupee') || q.includes('budget') || q.includes('₹')) {
    const costLabel = kpis.maintenanceCostPerTon >= 90 ? '🚨 Critical — above emergency threshold' : kpis.maintenanceCostPerTon >= 80 ? '⚠️ Warning — above target' : '✅ Within target';
    return `💰 Maintenance Cost Analysis:\n\nCurrent: ₹${kpis.maintenanceCostPerTon}/ton\nTarget: < ₹80/ton\nStatus: ${costLabel}\n\n${kpis.maintenanceCostPerTon >= 80 ? `Cost spike driven by ${highestRisk.name} degradation (Risk: ${highestRisk.riskScore}%). Preventive maintenance now will avoid ₹${Math.round((kpis.maintenanceCostPerTon - 74) * 100)} in unplanned repair costs.` : 'Maintenance costs are well-controlled. AI-driven scheduling has saved approximately ₹' + Math.round(kpis.downtimePrevented * 15000) + ' in downtime prevention this session.'}`;
  }

  // Alerts summary
  if (q.includes('alert') || q.includes('warning') || q.includes('critical') || q.includes('issue')) {
    if (recentAlerts.length === 0) {
      return `✅ No active alerts. All systems are operating within safe parameters.\n\nLast scan: just now\nMachines monitored: 3\nAI confidence: High`;
    }
    const latest = recentAlerts[0];
    return `🔔 Alert Summary:\n\nTotal active alerts: ${alerts.length}\nCritical: ${alerts.filter(a => a.severity === 'critical').length}\nWarnings: ${alerts.filter(a => a.severity === 'warning').length}\n\nLatest: ${latest.title}\n\nMost at-risk machine: ${highestRisk.name} (${highestRisk.riskScore}% risk score).`;
  }

  // Status overview
  if (q.includes('status') || q.includes('overview') || q.includes('summary') || q.includes('all') || q.includes('health')) {
    return `🏭 Factory Status Overview:\n\nCane Crusher: ${crusher.status.toUpperCase()} (${crusher.riskScore}% risk)\nSteam Boiler: ${boiler.status.toUpperCase()} (${boiler.riskScore}% risk)\nCentrifuge Unit: ${centrifuge.status.toUpperCase()} (${centrifuge.riskScore}% risk)\n\nPlant Efficiency: ${kpis.plantEfficiency}%\nActive Alerts: ${alerts.length}\n\n${criticals.length > 0 ? '🚨 ' + criticals.length + ' machine(s) need immediate attention!' : warnings.length > 0 ? '⚠️ ' + warnings.length + ' machine(s) under monitoring.' : '✅ All systems nominal. Zero-touch automation active.'}`;
  }

  // Downtime / savings
  if (q.includes('downtime') || q.includes('save') || q.includes('prevent') || q.includes('avoid')) {
    return `🛡️ AI Downtime Prevention:\n\nDowntime Prevented: ${kpis.downtimePrevented.toFixed(1)} hrs this session\nEstimated savings: ₹${Math.round(kpis.downtimePrevented * 15000).toLocaleString('en-IN')}\nAlerts triggered: ${alerts.length}\n\nSugarNXT AI has pre-empted ${alerts.filter(a => a.severity === 'critical').length} critical failure events using predictive telemetry analysis. Each hour of downtime in a sugar factory costs approximately ₹15,000 in lost production.`;
  }

  // Greeting / hello
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you')) {
    return `👋 Hello! I'm the SugarNXT AI Assistant.\n\nI have real-time access to all factory sensor data. You can ask me:\n\n• "Which machine will fail next?"\n• "What is the boiler status?"\n• "How is plant efficiency?"\n• "Show me alert summary"\n• "What is the maintenance cost?"\n\nAll my answers are based on live telemetry data.`;
  }

  // Default fallback with context
  return `🤖 SugarNXT AI Analysis:\n\nBased on current live data:\n\nHighest risk: ${highestRisk.name} at ${highestRisk.riskScore}%\nPlant efficiency: ${kpis.plantEfficiency}%\nActive alerts: ${alerts.length}\n\nCurrent system status: ${criticals.length > 0 ? '🚨 CRITICAL' : warnings.length > 0 ? '⚠️ WARNING' : '✅ OPTIMAL'}\n\nTry asking: "Which machine will fail next?" or "Boiler status" or "Show efficiency report".`;
}

export default function AIChatAssistant() {
  const { machines, kpis, alerts } = useFactory();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: "👋 Hello! I'm SugarNXT AI.\n\nI have live access to all factory sensor data. Ask me anything:\n• Which machine will fail next?\n• Boiler / crusher / centrifuge status\n• Plant efficiency report\n• Maintenance cost analysis\n• Active alerts summary",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI "thinking" delay
    setTimeout(() => {
      const response = generateAIResponse(text, machines, kpis, alerts);
      const aiMsg: Message = { id: `ai-${Date.now()}`, role: 'ai', text: response, ts: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const quickQueries = [
    'Which machine will fail next?',
    'Plant efficiency?',
    'Alert summary',
    'Boiler status',
  ];

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
              boxShadow: '0 0 30px rgba(34,211,238,0.4), 0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <Bot className="w-6 h-6 text-[#0f172a]" />
            {alerts.filter(a => a.severity === 'critical').length > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] font-bold flex items-center justify-center"
              >
                {alerts.filter(a => a.severity === 'critical').length}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-5 right-5 z-50 flex flex-col rounded-2xl overflow-hidden border border-[#22d3ee]/30"
            style={{
              width: 360,
              height: minimized ? 52 : 520,
              background: '#0d1b2a',
              boxShadow: '0 0 40px rgba(34,211,238,0.15), 0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div
              className="shrink-0 flex items-center gap-2.5 px-3 py-3 border-b cursor-pointer"
              style={{ borderColor: 'rgba(34,211,238,0.15)', background: 'rgba(34,211,238,0.06)' }}
              onClick={() => setMinimized(m => !m)}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' }}>
                <Bot className="w-4 h-4 text-[#0f172a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#f1f5f9] terminal-text">SugarNXT AI Assistant</p>
                <div className="flex items-center gap-1">
                  <motion.div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"
                    animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-[9px] text-[#475569] terminal-text">Live sensor context • {machines.length} machines</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}
                  className="p-1 rounded hover:bg-[#1e293b] text-[#475569] hover:text-[#94a3b8] transition-colors"
                >
                  {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setOpen(false); }}
                  className="p-1 rounded hover:bg-[#1e293b] text-[#475569] hover:text-[#ef4444] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5 min-h-0">
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'ai' && (
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                          style={{ background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' }}>
                          <Cpu className="w-3 h-3 text-[#0f172a]" />
                        </div>
                      )}
                      <div
                        className="max-w-[80%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line terminal-text"
                        style={{
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(14,165,233,0.15))'
                            : 'rgba(30,41,59,0.8)',
                          border: msg.role === 'user' ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(51,65,85,0.5)',
                          color: msg.role === 'user' ? '#e2e8f0' : '#94a3b8',
                        }}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mr-2"
                        style={{ background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' }}>
                        <Cpu className="w-3 h-3 text-[#0f172a]" />
                      </div>
                      <div className="flex items-center gap-1 bg-[#1e293b] rounded-xl px-3 py-2.5 border border-[#334155]">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick queries */}
                <div className="shrink-0 px-3 pb-2 flex gap-1.5 flex-wrap">
                  {quickQueries.map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 0); }}
                      className="text-[9px] terminal-text px-2 py-1 rounded-lg border border-[#22d3ee]/20 text-[#22d3ee]/70 hover:text-[#22d3ee] hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/05 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="shrink-0 px-3 pb-3">
                  <div className="flex items-center gap-2 bg-[#1e293b] rounded-xl border border-[#334155] px-3 py-2 focus-within:border-[#22d3ee]/40 transition-colors">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask about any machine, alert, or KPI..."
                      className="flex-1 bg-transparent text-[11px] text-[#e2e8f0] placeholder-[#334155] outline-none terminal-text"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                      style={{ background: input.trim() ? 'linear-gradient(135deg,#0ea5e9,#22d3ee)' : '#1e293b' }}
                    >
                      <Send className="w-3 h-3" style={{ color: input.trim() ? '#0f172a' : '#475569' }} />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, AlertTriangle, ShieldCheck, Skull, Loader2 } from 'lucide-react';

export default function TaskNegotiation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, sendFeedback, acceptTask, completeTask, failTask, isNegotiating } = useStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const task = tasks.find(t => t.id === id);

  useEffect(() => {
    if (!task) {
      navigate('/');
    }
  }, [task, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task?.negotiationLog]);

  if (!task) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isNegotiating) return;
    
    sendFeedback(task.id, input);
    setInput('');
  };

  const isAccepted = task.status === 'accepted';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left/Top Panel: Task Details */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-terminal-gray hover:text-terminal-green transition-colors uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> RETREAT
        </button>

        <div className="panel flex-1 flex flex-col overflow-y-auto border-terminal-green/50">
          <div className="flex items-center justify-between mb-6 border-b border-terminal-green/30 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-terminal-green uppercase">
              {task.title}
            </h1>
            <span className="text-xs border border-terminal-gray px-2 py-1 bg-black/60 uppercase">
              {task.category}
            </span>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <h3 className="text-xs uppercase text-terminal-gray mb-2 font-bold tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> CURRENT_DIRECTIVE
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {task.currentDescription}
              </p>
            </div>

            <div className="p-4 bg-terminal-green/10 border border-terminal-green/30">
              <h3 className="text-xs uppercase text-terminal-green mb-2 font-bold tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> COMPLETION_CRITERIA
              </h3>
              <p className="text-sm font-mono text-terminal-green">
                {task.completionCriteria}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-terminal-gray/30 space-y-3">
            {isNegotiating && (
              <button 
                onClick={() => acceptTask(task.id)}
                className="w-full btn-brutal bg-terminal-green/10 text-center"
              >
                ACCEPT_DIRECTIVE [接受指令]
              </button>
            )}
            
            {isAccepted && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => completeTask(task.id)}
                  className="w-full btn-brutal text-center flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> COMPLETED
                </button>
                <button 
                  onClick={() => failTask(task.id)}
                  className="w-full btn-brutal-red text-center flex items-center justify-center gap-2"
                >
                  <Skull className="w-4 h-4" /> ABORT
                </button>
              </div>
            )}

            {(task.status === 'completed' || task.status === 'failed') && (
              <div className={`text-center font-bold p-3 uppercase border ${task.status === 'completed' ? 'text-terminal-green border-terminal-green' : 'text-terminal-red border-terminal-red'}`}>
                STATUS: {task.status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right/Bottom Panel: Terminal Chat */}
      <div className="lg:w-2/3 panel flex flex-col border-terminal-gray">
        <div className="text-xs text-terminal-gray mb-4 border-b border-terminal-gray pb-2 flex justify-between">
          <span>TERMINAL // SECURE_CHANNEL</span>
          <span className="animate-pulse text-terminal-green">LIVE</span>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 font-mono text-sm sm:text-base scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {task.negotiationLog.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className={`text-[10px] uppercase mb-1 ${msg.role === 'user' ? 'text-terminal-gray' : 'text-terminal-green/70'}`}>
                  {msg.role === 'user' ? 'YOU' : 'SYSTEM'} // {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <div 
                  className={`max-w-[85%] p-3 whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' 
                      ? 'border border-terminal-gray bg-black/60 text-terminal-gray' 
                      : 'border-l-2 border-terminal-green bg-terminal-green/5 text-terminal-green'
                  }`}
                >
                  {msg.role === 'ai' && idx === task.negotiationLog.length - 1 ? (
                    <TypewriterText text={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
              </motion.div>
            ))}
            
            {isNegotiating && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start"
              >
                <span className="text-[10px] uppercase mb-1 text-terminal-green/70">
                  SYSTEM // ANALYZING_RESISTANCE
                </span>
                <div className="max-w-[85%] p-3 border-l-2 border-terminal-green bg-terminal-green/5 text-terminal-green flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="animate-pulse">PROCESSING...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {task.status === 'negotiating' ? (
          <form onSubmit={handleSend} className="relative mt-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-green font-bold">
              $
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isNegotiating ? "SYSTEM IS PROCESSING..." : "Enter feedback or excuses..."}
              disabled={isNegotiating}
              className="w-full bg-black/80 border border-terminal-green/50 text-terminal-green font-mono py-3 pl-8 pr-12 focus:outline-none focus:border-terminal-green focus:ring-1 focus:ring-terminal-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!input.trim() || isNegotiating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-terminal-gray hover:text-terminal-green disabled:opacity-50 disabled:hover:text-terminal-gray transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="mt-auto p-3 text-center border border-terminal-gray border-dashed text-terminal-gray text-sm uppercase">
            {isAccepted ? 'INPUT_DISABLED // EXECUTING_DIRECTIVE' : 'CHANNEL_CLOSED'}
          </div>
        )}
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      <span className="animate-blink inline-block w-2 h-4 bg-terminal-green ml-1 align-middle"></span>
    </span>
  );
}

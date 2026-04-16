import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldAlert, CheckCircle2, ShieldBan, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { tasks, userProfile, isGeneratingTasks, resetApp } = useStore();
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-terminal-green" />;
      case 'failed': return <ShieldBan className="w-5 h-5 text-terminal-red" />;
      case 'accepted': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <ArrowRight className="w-5 h-5 text-terminal-gray group-hover:text-terminal-bg" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'failed': return '已放弃';
      case 'accepted': return '执行中';
      default: return '博弈中';
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'negotiating' || t.status === 'accepted');
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel border-terminal-green"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-terminal-green opacity-50"></div>
        <h1 className="text-2xl sm:text-4xl font-bold uppercase mb-4 tracking-widest flex items-center gap-3">
          <span className="text-terminal-green">_</span> SYSTEM.ASSESSMENT
        </h1>
        <div className="bg-black/60 p-4 border-l-4 border-terminal-green font-mono text-sm sm:text-base leading-relaxed">
          <span className="text-terminal-gray mr-2">&gt;</span> 
          {userProfile.aiAssessment}
          <span className="inline-block w-2 h-4 bg-terminal-green ml-1 animate-blink align-middle"></span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="border border-terminal-gray p-3">
            <div className="text-xs text-terminal-gray mb-1 uppercase">LEVEL</div>
            <div className="text-xl sm:text-2xl font-bold">{userProfile.level}</div>
          </div>
          <div className="border border-terminal-gray p-3">
            <div className="text-xs text-terminal-gray mb-1 uppercase">RESISTANCE</div>
            <div className={`text-xl sm:text-2xl font-bold ${userProfile.resistanceScore > 10 ? 'text-terminal-red' : ''}`}>
              {userProfile.resistanceScore}
            </div>
          </div>
          <div className="border border-terminal-gray p-3">
            <div className="text-xs text-terminal-gray mb-1 uppercase">TODAY'S DIRECTIVES</div>
            <div className="text-xl sm:text-2xl font-bold">{tasks.length}</div>
          </div>
          <div className="border border-terminal-gray p-3">
            <div className="text-xs text-terminal-gray mb-1 uppercase">COMPLETED</div>
            <div className="text-xl sm:text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
          </div>
        </div>
      </motion.div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-terminal-gray pb-2">
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-terminal-red" />
            ACTIVE_DIRECTIVES
          </h2>
          <button 
            onClick={resetApp}
            className="text-xs text-terminal-gray hover:text-terminal-red flex items-center gap-1 transition-colors"
            title="Wipe Memory (Reset)"
          >
            <RefreshCw className="w-3 h-3" /> WIPE_MEMORY
          </button>
        </div>
        
        <div className="grid gap-4">
          {isGeneratingTasks ? (
            <div className="panel border-dashed text-terminal-green flex flex-col items-center justify-center py-12 gap-4">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <div className="text-sm font-mono uppercase tracking-widest">
                ANALYZING_USER_PROFILE // GENERATING_DIRECTIVES...
                <span className="inline-block w-2 h-4 bg-terminal-green ml-1 animate-blink align-middle"></span>
              </div>
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="panel border-dashed text-terminal-gray text-center py-10">
              NO ACTIVE DIRECTIVES. WAIT FOR THE NEXT CYCLE.
            </div>
          ) : (
            activeTasks.map((task, i) => (
              <motion.button
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate(`/task/${task.id}`)}
                className={`panel group hover:bg-terminal-green hover:text-terminal-bg transition-colors duration-300 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${task.status === 'accepted' ? 'border-yellow-400' : 'border-terminal-gray'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs px-2 py-1 bg-terminal-gray/20 border border-terminal-gray group-hover:border-terminal-bg group-hover:bg-transparent">
                      {task.category.toUpperCase()}
                    </span>
                    <span className={`text-xs font-bold ${task.status === 'accepted' ? 'text-yellow-400 group-hover:text-terminal-bg' : 'text-terminal-gray group-hover:text-terminal-bg'}`}>
                      [{getStatusText(task.status)}]
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-wide">{task.title}</h3>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 sm:border-l border-terminal-gray/30 pt-4 sm:pt-0 sm:pl-4 group-hover:border-terminal-bg/30">
                  <span className="text-sm font-mono opacity-60">ENTER_TERMINAL</span>
                  {getStatusIcon(task.status)}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4 opacity-60 mt-12">
          <h2 className="text-sm font-bold tracking-widest flex items-center gap-2 border-b border-terminal-gray pb-2 text-terminal-gray">
            ARCHIVED_TODAY
          </h2>
          <div className="grid gap-2">
            {completedTasks.map(task => (
              <div key={task.id} className="p-3 border border-terminal-gray flex justify-between items-center bg-black/40">
                <span className={task.status === 'failed' ? 'line-through text-terminal-red' : 'text-terminal-green'}>
                  {task.title}
                </span>
                <span className="text-xs uppercase">{getStatusText(task.status)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

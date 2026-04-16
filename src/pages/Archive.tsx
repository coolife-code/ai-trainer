import { useStore } from '../store';
import { motion } from 'framer-motion';
import { Activity, ShieldBan, ShieldCheck, Database, FileText } from 'lucide-react';

export default function Archive() {
  const { tasks, userProfile } = useStore();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  return (
    <div className="space-y-8">
      <div className="panel border-terminal-gray">
        <h1 className="text-2xl sm:text-4xl font-bold uppercase mb-4 tracking-widest flex items-center gap-3">
          <Database className="w-8 h-8 text-terminal-green" />
          EVOLUTION_ARCHIVE
        </h1>
        <p className="text-terminal-gray font-mono text-sm max-w-2xl leading-relaxed">
          这里记录了你所有的挣扎、妥协与罕见的突破。系统不会遗忘，你的借口已被永久归档。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel border-terminal-green/30"
        >
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2 border-b border-terminal-gray pb-2 mb-4 text-terminal-green">
            <Activity className="w-5 h-5" />
            USER_PROFILE_MATRIX
          </h2>
          
          <div className="space-y-6">
            <div className="bg-black/60 p-4 border-l-2 border-terminal-gray">
              <div className="text-xs text-terminal-gray mb-1 uppercase tracking-wider">LATEST_ASSESSMENT</div>
              <p className="font-mono text-sm leading-relaxed text-terminal-green/90">
                {userProfile.aiAssessment}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border border-terminal-gray/30 p-3 bg-terminal-green/5">
                <div className="text-xs text-terminal-gray uppercase mb-1">TOTAL_COMPLETED</div>
                <div className="text-3xl font-bold text-terminal-green">{completedTasks.length}</div>
              </div>
              <div className="border border-terminal-gray/30 p-3 bg-terminal-red/5">
                <div className="text-xs text-terminal-gray uppercase mb-1">TOTAL_ABORTED</div>
                <div className="text-3xl font-bold text-terminal-red">{failedTasks.length}</div>
              </div>
              <div className="border border-terminal-gray/30 p-3 col-span-2 bg-black/40">
                <div className="text-xs text-terminal-gray uppercase mb-1">RESISTANCE_INDEX</div>
                <div className="text-xl font-bold font-mono tracking-widest text-terminal-gray">
                  [{'='.repeat(Math.min(userProfile.resistanceScore / 5, 20))}{'_'.repeat(Math.max(20 - Math.min(userProfile.resistanceScore / 5, 20), 0))}] {userProfile.resistanceScore}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel border-terminal-gray"
        >
          <h2 className="text-xl font-bold tracking-widest flex items-center gap-2 border-b border-terminal-gray pb-2 mb-4">
            <FileText className="w-5 h-5 text-terminal-gray" />
            DIRECTIVE_HISTORY
          </h2>

          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
            {[...completedTasks, ...failedTasks].length === 0 ? (
              <div className="text-terminal-gray/50 text-center py-10 text-sm border border-dashed border-terminal-gray/30 font-mono">
                NO_RECORDS_FOUND // SYSTEM_WAITING
              </div>
            ) : (
              [...completedTasks, ...failedTasks]
                .sort((a, b) => b.id.localeCompare(a.id)) // Simple sort mock
                .map((task) => (
                <div 
                  key={task.id} 
                  className={`border p-3 text-sm flex items-start gap-3 ${
                    task.status === 'completed' 
                      ? 'border-terminal-green/30 bg-terminal-green/5' 
                      : 'border-terminal-red/30 bg-terminal-red/5'
                  }`}
                >
                  <div className="mt-0.5">
                    {task.status === 'completed' 
                      ? <ShieldCheck className="w-4 h-4 text-terminal-green" /> 
                      : <ShieldBan className="w-4 h-4 text-terminal-red" />
                    }
                  </div>
                  <div>
                    <div className="font-bold tracking-wide mb-1 uppercase">
                      {task.title}
                    </div>
                    <div className="text-xs text-terminal-gray font-mono mb-2">
                      CAT: {task.category} // DIFF: LOGGED
                    </div>
                    <div className={`font-mono text-xs leading-relaxed ${task.status === 'completed' ? 'text-terminal-green/70' : 'text-terminal-red/70'}`}>
                      {task.completionCriteria}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

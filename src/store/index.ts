import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateTasksFromAI, negotiateWithAI, generateId } from '../lib/ai';

export interface NegotiationMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  currentDescription: string;
  completionCriteria: string;
  status: 'negotiating' | 'accepted' | 'completed' | 'failed';
  negotiationLog: NegotiationMessage[];
  category: 'social' | 'physical' | 'cognitive' | 'courage';
}

export interface UserProfile {
  level: number;
  resistanceScore: number;
  aiAssessment: string;
}

interface AppState {
  userProfile: UserProfile;
  tasks: Task[];
  lastLoginDate: string | null;
  isGeneratingTasks: boolean;
  isNegotiating: boolean;
  
  initializeDailyTasks: () => Promise<void>;
  sendFeedback: (taskId: string, feedback: string) => Promise<void>;
  acceptTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  failTask: (taskId: string) => void;
  resetApp: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfile: {
        level: 1,
        resistanceScore: 0,
        aiAssessment: '初次接触。正在对你的平庸生活模式进行扫描建模。不要抱有侥幸心理。',
      },
      tasks: [],
      lastLoginDate: null,
      isGeneratingTasks: false,
      isNegotiating: false,

      initializeDailyTasks: async () => {
        const state = get();
        const today = new Date().toDateString();
        
        // If tasks exist for today, do not overwrite
        if (state.lastLoginDate === today && state.tasks.length > 0) {
          return;
        }
        
        set({ isGeneratingTasks: true });
        
        try {
          const generatedTasks = await generateTasksFromAI(state.userProfile);
          set({
            tasks: generatedTasks,
            lastLoginDate: today,
            isGeneratingTasks: false,
          });
        } catch (error) {
          console.error("Failed to fetch initial tasks", error);
          set({ isGeneratingTasks: false });
        }
      },

      sendFeedback: async (taskId, feedback) => {
        set({ isNegotiating: true });
        
        const state = get();
        const newTasks = [...state.tasks];
        const taskIndex = newTasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
          set({ isNegotiating: false });
          return;
        }
        
        const task = { ...newTasks[taskIndex] };
        
        // Optimistic UI: Add user message immediately
        task.negotiationLog = [
          ...task.negotiationLog,
          { id: generateId(), role: 'user', content: feedback, timestamp: Date.now() }
        ];
        newTasks[taskIndex] = task;
        set({ tasks: newTasks });
        
        // AI response processing
        try {
          const aiLogic = await negotiateWithAI(task, state.userProfile, feedback);
          
          if (aiLogic.updatedDescription && aiLogic.updatedDescription.trim() !== '') {
            task.currentDescription = aiLogic.updatedDescription;
          }
          if (aiLogic.updatedCriteria && aiLogic.updatedCriteria.trim() !== '') {
            task.completionCriteria = aiLogic.updatedCriteria;
          }
          
          task.negotiationLog = [
            ...task.negotiationLog,
            { id: generateId(), role: 'ai', content: aiLogic.aiResponse, timestamp: Date.now() }
          ];
          
          // Update user profile from AI deep analysis
          const newProfile = { ...state.userProfile };
          newProfile.resistanceScore += aiLogic.resistanceDelta;
          if (aiLogic.profileAnalysis) {
            newProfile.aiAssessment = aiLogic.profileAnalysis;
          }
          
          newTasks[taskIndex] = task;
          set({ 
            tasks: newTasks, 
            userProfile: newProfile,
            isNegotiating: false 
          });

        } catch (error) {
          console.error('Error negotiating', error);
          set({ isNegotiating: false });
        }
      },

      acceptTask: (taskId) => {
        set((state) => {
          const newTasks = state.tasks.map(t => 
            t.id === taskId ? { ...t, status: 'accepted' as const } : t
          );
          return { tasks: newTasks };
        });
      },

      completeTask: (taskId) => {
        set((state) => {
          const newTasks = state.tasks.map(t => 
            t.id === taskId ? { ...t, status: 'completed' as const } : t
          );
          const newProfile = { ...state.userProfile };
          newProfile.level += 1;
          newProfile.aiAssessment = `${newProfile.aiAssessment} | 最新状态：完成了一次微小的挣扎，但这不足以让我改变对你的判断。`;
          
          return { tasks: newTasks, userProfile: newProfile };
        });
      },

      failTask: (taskId) => {
        set((state) => {
          const newTasks = state.tasks.map(t => 
            t.id === taskId ? { ...t, status: 'failed' as const } : t
          );
          const newProfile = { ...state.userProfile };
          newProfile.resistanceScore += 10;
          newProfile.aiAssessment = `${newProfile.aiAssessment} | 最新状态：懦弱暴露无遗。放弃指令。`;
          return { tasks: newTasks, userProfile: newProfile };
        });
      },

      resetApp: () => {
        set({
          userProfile: {
            level: 1,
            resistanceScore: 0,
            aiAssessment: '系统重启。清除你的过往并不代表你重生了。继续接受考验。',
          },
          tasks: [],
          lastLoginDate: null,
          isGeneratingTasks: false,
          isNegotiating: false
        });
      }
    }),
    {
      name: 'awakening-directives-storage',
      // Do not persist loading states
      partialize: (state) => ({ 
        userProfile: state.userProfile, 
        tasks: state.tasks, 
        lastLoginDate: state.lastLoginDate 
      }),
    }
  )
);

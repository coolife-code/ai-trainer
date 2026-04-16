import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useStore } from './store';
import { Terminal, Activity, Archive as ArchiveIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TaskNegotiation from './pages/TaskNegotiation';
import Archive from './pages/Archive';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="glitch-overlay z-0"></div>
      
      <header className="border-b border-terminal-green/30 bg-black/80 backdrop-blur z-10 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Terminal className="w-6 h-6 text-terminal-green group-hover:animate-pulse" />
            <span className="font-bold tracking-widest text-lg">AWAKENING_DIRECTIVES</span>
          </Link>
          
          <nav className="flex gap-6">
            <Link 
              to="/" 
              className={`flex items-center gap-2 uppercase text-sm tracking-wider hover:text-terminal-green transition-colors ${location.pathname === '/' ? 'text-terminal-green border-b border-terminal-green' : 'text-terminal-gray'}`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">控制台</span>
            </Link>
            <Link 
              to="/archive" 
              className={`flex items-center gap-2 uppercase text-sm tracking-wider hover:text-terminal-green transition-colors ${location.pathname === '/archive' ? 'text-terminal-green border-b border-terminal-green' : 'text-terminal-gray'}`}
            >
              <ArchiveIcon className="w-4 h-4" />
              <span className="hidden sm:inline">突破档案</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 z-10">
        {children}
      </main>
      
      <footer className="border-t border-terminal-green/20 py-4 text-center text-xs text-terminal-gray z-10">
        <p>SYSTEM.VERSION 1.0.0 // NO_MERCY_PROTOCOL_ACTIVE</p>
      </footer>
    </div>
  );
}

function App() {
  const initializeDailyTasks = useStore((state) => state.initializeDailyTasks);

  useEffect(() => {
    initializeDailyTasks();
  }, [initializeDailyTasks]);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/task/:id" element={<TaskNegotiation />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

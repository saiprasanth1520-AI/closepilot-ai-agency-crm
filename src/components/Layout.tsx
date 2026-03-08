import React from 'react';
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings, Bell, Search, Building2, LogOut } from 'lucide-react';
import { useAppStore } from '../stores/app-store';
import { useAuthStore } from '../stores/auth-store';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  navigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, navigate }) => {
  const { searchQuery, setSearchQuery } = useAppStore();
  const { user, isDemo, logout } = useAuthStore();
  const location = useLocation();
  const currentPath = '/' + (location.pathname.split('/')[1] || 'dashboard');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || (isDemo ? 'Demo User' : 'User');
  const displayEmail = user?.email || (isDemo ? 'demo@lumina.app' : '');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-surface/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">Lumina</span>
            {isDemo && (
              <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-medium">DEMO</span>
            )}
          </div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentPath === '/dashboard'} onClick={() => navigate('/dashboard')} />
            <NavItem icon={<Users size={20} />} label="Leads" active={currentPath === '/leads' || currentPath === '/lead'} onClick={() => navigate('/leads')} />
            <NavItem icon={<Briefcase size={20} />} label="Pipeline" active={currentPath === '/pipeline' || currentPath === '/deals'} onClick={() => navigate('/pipeline')} />
            <NavItem icon={<Building2 size={20} />} label="Accounts" active={currentPath === '/accounts'} onClick={() => navigate('/accounts')} />
            <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={currentPath === '/analytics'} onClick={() => navigate('/analytics')} />
          </nav>
        </div>

        {/* User section */}
        <div className="mt-auto p-6 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
              {displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-textSecondary truncate">{displayEmail}</p>
            </div>
          </div>
          <NavItem icon={<LogOut size={20} />} label="Sign Out" active={false} onClick={handleLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-surface/10">
          <div className="flex items-center gap-4 bg-surface/50 px-4 py-2 rounded-full border border-border w-96">
            <Search size={18} className="text-textSecondary" />
            <input
              type="text"
              placeholder="Search campaigns, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${active ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-surface hover:text-text'}
  `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

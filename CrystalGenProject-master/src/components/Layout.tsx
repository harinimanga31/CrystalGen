import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Zap,
  History,
  Eye,
  AtomIcon,
  Download,
  Upload,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string } | null>(null);

  // ✅ Load user from localStorage initially
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Listen for login/logout changes
  useEffect(() => {
    const handleUserChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    // Listen to both manual custom event & browser storage change
    window.addEventListener("userChange", handleUserChange);
    window.addEventListener("storage", handleUserChange);

    return () => {
      window.removeEventListener("userChange", handleUserChange);
      window.removeEventListener("storage", handleUserChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userChange")); // notify all listeners
    setUser(null);
    navigate("/login");
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Generate", href: "/generate", icon: Zap },
    { name: "History", href: "/history", icon: History },
    // { name: "Visualization", href: "/visualization", icon: Eye },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <AtomIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CrystalGen
                </h1>
                <p className="text-xs text-slate-500">AI Crystal Discovery</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-slate-600 hover:text-blue-600"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-slate-600 hover:text-purple-600"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-sm text-slate-700 hidden sm:inline">
                    Hi, {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-slate-600 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

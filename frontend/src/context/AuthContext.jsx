import { createContext, useContext, useEffect, useState } from "react";
import { getMe,logoutUser } from "../service/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Called once when app loads ────────────────────────
  useEffect(() => {
    getMe()
      .then((res) => {
        // /me succeeded — user is logged in
        setUser(res.data?.user || null);
      })
      .catch(() => {
        // /me failed — user not logged in, that's fine
        setUser(null);
      })
      .finally(() => {
        // ALWAYS stop loading — app never stays blank
        setLoading(false);
      });
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = async () => {
    try { await logoutUser(); } catch (_) {}
    setUser(null);
  };

  // ── Show spinner while checking login status ──────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F6F8] gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] rounded-2xl flex items-center justify-center text-2xl shadow-lg">
          🌿
        </div>
        <svg className="animate-spin w-5 h-5 text-[#2D6A4F]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2"/>
          <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <p className="text-[13px] text-[#9CA3AF] font-medium">Loading BhojanSetu...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook — use in any component ───────────────────────────
export const useAuth = () => useContext(AuthContext);

export default AuthContext;

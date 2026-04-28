import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ShieldCheck, Chrome, Lock, Mail, AlertTriangle } from "lucide-react";
import { authService } from "../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      const papel = response.papel; // 'empresa', 'escola', 'cantina', 'responsavel'

      // Redireciona dependendo de quem logou
      if (papel === 'cantina') {
        navigate('/cantina'); // Manda o operador direto para a tela de biometria
      } else if (papel === 'escola') {
        navigate('/alunos'); // Escola vai gerenciar alunos
      } else {
        navigate('/dashboard'); // Administrador/Empresa vê tudo
      }
    } catch (err) {
      setError("Credenciais incorretas!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">SysMerenda</h1>
          <p className="text-slate-400 text-sm mt-1">Sistema de Controle de Refeições Escolares</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-800 text-xl font-semibold mb-1">Bem-vindo de volta</h2>
          <p className="text-gray-500 text-sm mb-6">Acesse com suas credenciais institucionais</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@escola.edu.br"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <button type="button" className="text-xs text-emerald-600 hover:text-emerald-700">
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Autenticando...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            Entrar com Google
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Fiscal / Admin</span>
          </button>

          {/* LGPD notice */}
          <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
            🔒 Acesso restrito. Todos os acessos são registrados em conformidade com a{" "}
            <span className="font-medium text-gray-500">Lei nº 13.709/2018 (LGPD)</span>.
          </p>
        </div>

        {/* Version */}
        <p className="text-center text-slate-500 text-xs mt-4">
          SysMerenda v2.1.0 • Prefeitura Municipal
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true); 
    try {
      const res = await authAPI.login(email, password,1);
      
      // atteso: { token: string } (se nel tuo backend è diverso, lo adatteremo quando mi passi le API)
      const token = res?.token;
      if (!token) throw new Error('Login riuscito ma token mancante nella risposta.');
      localStorage.setItem('auth_token', token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-gray-600 mt-1">Accedi con credenziali ufficiali</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-gray-700">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button className="w-full" disabled={loading} type="submit">
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Nota: nessun dato è “dummy”. Se il login fallisce, probabilmente manca l’endpoint o la forma della risposta è diversa.
        </p>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// =============================================================================
// AUTENTICAÇÃO PADRÃO SUPABASE
// =============================================================================

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Cadastro de novo usuário
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: email.split('@')[0],
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este email já está cadastrado. Faça login.');
            setIsSignUp(false);
          } else {
            toast.error(error.message);
          }
          setIsLoading(false);
          return;
        }

        toast.success('Conta criada! Entre em contato para ativar o acesso.');
        setIsLoading(false);
        return;
      }

      // Login padrão do Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Email ou senha incorretos');
        setIsLoading(false);
        return;
      }

      // Login bem-sucedido - o AccessGate vai verificar se é pago
      toast.success('Login realizado com sucesso!');
      navigate('/');
      
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('Algo deu errado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">MEDTRACK</h1>
              <p className="text-sm text-muted-foreground">Estudos médicos</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold font-display mb-2">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isSignUp 
              ? 'Crie sua conta para acessar a plataforma' 
              : 'Entre com seu email e senha'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp 
                ? 'Já tem conta? Entre aqui' 
                : 'Não tem conta? Crie uma'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-sm mb-2">Bem-vindo ao MEDTRACK!</h3>
            <p className="text-xs text-muted-foreground">
              Plataforma de estudos para medicina.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90" />
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-primary-foreground/20 rounded-3xl flex items-center justify-center mb-8 mx-auto backdrop-blur-sm">
              <Stethoscope className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold font-display mb-4">
              MEDTRACK
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Sua plataforma de estudos médicos.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

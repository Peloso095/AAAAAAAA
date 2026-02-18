/**
 * Diagnostic Page - Test Supabase Integration
 * Access at /diagnostico after login
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Database,
  User,
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

type TestStatus = 'pending' | 'loading' | 'success' | 'error';

interface TestResult {
  name?: string;
  status: TestStatus;
  message?: string;
  details?: string;
}

export default function Diagnostico() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const runTests = async () => {
    if (!user) return;
    
    setIsRunning(true);
    
    // Define all tests
    const testDefinitions = [
      { name: 'Supabase Connection', fn: testSupabaseConnection },
      { name: 'User Profile', fn: testProfile },
      { name: 'User Preferences', fn: testUserPreferences },
      { name: 'Subjects', fn: testSubjects },
      { name: 'Flashcards', fn: testFlashcards },
      { name: 'Questions', fn: testQuestions },
      { name: 'Question Attempts', fn: testQuestionAttempts },
      { name: 'Summaries', fn: testSummaries },
      { name: 'Subscriptions', fn: testSubscriptions },
      { name: 'Access Check', fn: testAccess },
    ];

    // Reset all tests to pending
    setTests(testDefinitions.map(t => ({ name: t.name, status: 'pending' })));

    // Run each test sequentially
    for (let i = 0; i < testDefinitions.length; i++) {
      const test = testDefinitions[i];
      
      // Set to loading
      setTests(prev => prev.map((t, idx) => 
        idx === i ? { ...t, status: 'loading' } : t
      ));

      try {
        const result = await test.fn(user.id);
        setTests(prev => prev.map((t, idx) => 
          idx === i ? { ...t, status: result.status, message: result.message, details: result.details } : t
        ));
      } catch (error: any) {
        setTests(prev => prev.map((t, idx) => 
          idx === i ? { ...t, status: 'error', message: error.message } : t
        ));
      }
    }

    setIsRunning(false);
  };

  // Test functions
  const testSupabaseConnection = async (): Promise<TestResult> => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      return { status: 'success', message: 'Connected successfully', details: `URL: ${import.meta.env.VITE_SUPABASE_URL}` };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testProfile = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return { 
          status: 'success', 
          message: 'Profile exists',
          details: `Level: ${data.level}, XP: ${data.xp_points}, Premium: ${data.is_premium}`
        };
      } else {
        return { status: 'error', message: 'Profile not found' };
      }
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testUserPreferences = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      return { 
        status: 'success', 
        message: data ? 'Preferences found' : 'No preferences yet (onboarding needed)',
        details: data ? `Goal: ${data.goal}, Onboarding: ${data.onboarding_completed}` : undefined
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testSubjects = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return { 
        status: 'success', 
        message: `${data?.length || 0} subjects found`,
        details: data?.map(s => s.name).join(', ') || 'None'
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testFlashcards = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('id, subject_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return { 
        status: 'success', 
        message: `${data?.length || 0} flashcards found`,
        details: `With subject_id: ${data?.filter(f => f.subject_id).length || 0}`
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testQuestions = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return { 
        status: 'success', 
        message: `${data?.length || 0} questions found` 
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testQuestionAttempts = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('question_attempts')
        .select('id, is_correct')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const correct = data?.filter(a => a.is_correct).length || 0;
      return { 
        status: 'success', 
        message: `${data?.length || 0} attempts`,
        details: `Correct: ${correct}, Rate: ${data?.length ? Math.round((correct / data.length) * 100) : 0}%`
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testSummaries = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('summaries')
        .select('id')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      return { 
        status: 'success', 
        message: `${data?.length || 0} summaries found` 
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testSubscriptions = async (userId: string): Promise<TestResult> => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan_type, expires_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return { 
          status: 'success', 
          message: `Status: ${data.status}`,
          details: `Plan: ${data.plan_type}, Expires: ${data.expires_at || 'N/A'}`
        };
      } else {
        return { status: 'success', message: 'No subscription (free tier)' };
      }
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const testAccess = async (userId: string): Promise<TestResult> => {
    try {
      // Check if user is admin
      const isDev = user?.email?.toLowerCase() === 'rafaelpeloso0909@gmail.com';
      
      // Check subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      const hasAccess = isDev || !!sub;
      
      return { 
        status: hasAccess ? 'success' : 'error', 
        message: hasAccess ? 'Access granted' : 'No access',
        details: `Dev: ${isDev ? 'Yes' : 'No'}, Active Subscription: ${!!sub ? 'Yes' : 'No'}`
      };
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'loading':
        return <Badge variant="secondary">Running...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const progress = tests.length > 0 ? (successCount / tests.length) * 100 : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔧 Diagnóstico do Sistema</h1>
            <p className="text-muted-foreground mt-1">
              Teste a integração com Supabase em 5 minutos
            </p>
          </div>
          <Button onClick={runTests} disabled={isRunning || !user}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Executar Testes
              </>
            )}
          </Button>
        </div>

        {/* Environment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuração do Ambiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Supabase URL:</span>
                <p className="font-mono text-xs truncate">{import.meta.env.VITE_SUPABASE_URL}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Site URL:</span>
                <p className="font-mono text-xs">{import.meta.env.VITE_SITE_URL || window.location.origin}</p>
              </div>
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <p className="font-mono text-xs truncate">{user?.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-mono text-xs">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {tests.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">
                  {successCount} Passed, {errorCount} Failed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <div className="grid gap-3">
          {tests.map((test, index) => (
            <Card key={test.name} className={test.status === 'error' ? 'border-red-200' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      {test.message && (
                        <p className={`text-sm ${test.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {test.message}
                        </p>
                      )}
                      {test.details && (
                        <p className="text-xs text-muted-foreground mt-1">{test.details}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        {tests.length > 0 && !isRunning && (
          <Card className={errorCount > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {errorCount > 0 ? (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-medium text-red-700">
                        {errorCount} problema(s) encontrado(s)
                      </p>
                      <p className="text-sm text-red-600">
                        Reveja os testes falhados acima e execute as correções necessárias.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700">
                        Sistema funcionando perfeitamente!
                      </p>
                      <p className="text-sm text-green-600">
                        Todas as integrações estão OK. Seu app está pronto para produção.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/onboarding')}>
            Onboarding
          </Button>
          <Button variant="outline" onClick={() => navigate('/assinatura')}>
            Assinatura
          </Button>
          <Button variant="outline" onClick={() => navigate('/materias')}>
            Matérias
          </Button>
        </div>
      </div>
    </div>
  );
}

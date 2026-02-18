import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Check, 
  Copy, 
  MessageCircle, 
  ArrowLeft,
  Crown,
  Clock,
  Shield,
  AlertTriangle,
  Smartphone,
  Mail,
  FileText,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PIX_KEY = import.meta.env.VITE_PIX_KEY || '(35) 99921-0503';
const PRICE = import.meta.env.VITE_MONTHLY_PRICE || '15,90';
const PHONE = import.meta.env.VITE_CONTACT_PHONE || '+5535999210503';

export default function Assinatura() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY.replace(/\D/g, ''));
    toast.success('Chave PIX copiada!');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de ativar minha assinatura no MEDTRACK.\n\nMeu e-mail cadastrado na plataforma: [SEU EMAIL]\n\nSegue o comprovante de pagamento.`
    );
    window.open(`https://wa.me/${PHONE.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate('/auth')}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {user && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Você já tem acesso premium!
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Logado como {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">Assine o MEDTRACK</CardTitle>
            <CardDescription className="text-base">
              Acesso completo a todos os recursos premium
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            
            {/* SEÇÃO 1: Pagamento via PIX */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                  1. Pagamento via PIX
                </h3>
              </div>
              
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Realize o pagamento utilizando a chave PIX <strong>(celular)</strong>:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Chave PIX</p>
                  <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                    {PIX_KEY}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30"
                  onClick={handleCopyPix}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>

            {/* SEÇÃO 2: Envio do Comprovante */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-green-900 dark:text-green-100">
                  2. Envio do Comprovante
                </h3>
              </div>
              
              <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                Após a realização do pagamento, envie uma mensagem via <strong>WhatsApp</strong> para o mesmo número:
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-300 dark:border-green-700 mb-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-300">{PHONE}</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                  Na mensagem, informe <strong>obrigatoriamente</strong>:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <Mail className="w-4 h-4 mt-0.5 text-yellow-600" />
                    <span>Seu <strong>e-mail</strong> cadastrado na plataforma</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <FileText className="w-4 h-4 mt-0.5 text-yellow-600" />
                    <span>O <strong>comprovante</strong> de pagamento</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <Check className="w-4 h-4 inline mr-1" />
                  A assinatura será ativada manualmente após a <strong>verificação do pagamento</strong>.
                </p>
              </div>
            </div>

            {/* SEÇÃO 3: Prazo de Ativação */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">
                  ⏱ Prazo de Ativação
                </h3>
              </div>
              
              <p className="text-sm text-purple-800 dark:text-purple-200">
                A ativação será realizada em <strong>até 24 horas</strong> após o envio correto das informações.
              </p>

              <Separator className="my-4" />

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Caso a assinatura não seja ativada dentro do prazo de <strong>24 horas</strong>, o valor pago será <strong>integralmente devolvido</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: Termos de Uso e Responsabilidade */}
            <div className="bg-slate-50 dark:bg-slate-900/20 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  ⚖️ Termos de Uso e Responsabilidade
                </h3>
              </div>
              
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500" />
                  <span>O acesso à plataforma é <strong>individual, pessoal e intransferível</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" />
                  <span>É <strong>expressamente proibido</strong> o compartilhamento de login, senha ou qualquer forma de acesso com terceiros.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500" />
                  <span>A identificação de uso simultâneo, compartilhamento de credenciais ou qualquer tentativa de violação resultará no <strong>cancelamento imediato e definitivo</strong> da conta, <strong>sem direito a reembolso</strong>.</span>
                </li>
              </ul>

              <Separator className="my-4" />

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Ao realizar o pagamento, o usuário declara estar de acordo com os termos acima.
                </p>
              </div>
            </div>

            {/* Botão WhatsApp */}
            <Button 
              className="w-full gap-2 bg-green-500 hover:bg-green-600 h-12 text-base font-medium"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-5 h-5" />
              Enviar Comprovante via WhatsApp
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Dúvidas? Fale conosco pelo WhatsApp</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

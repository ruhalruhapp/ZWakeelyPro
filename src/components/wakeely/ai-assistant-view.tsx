'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Paperclip,
  FileText,
  ShieldAlert,
  Lightbulb,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Simulated AI Responses ──────────────────────────────────────────────────

const KEYWORD_RESPONSES: [string[], string][] = [
  [['تلخيص', 'summarize', 'summary', 'ملخص'], 'بناءً على تحليل القضية، إليك ملخص شامل:\n\n**الملخص الرئيسي:**\n- تركز القضية على النزاع التجاري بين الطرفين\n- تم تقديم المستندات الأساسية بالكامل\n- هناك 3 جلسات مجدولة في الشهر القادم\n- نسبة النجاح المتوقعة: 72%\n\n**النقاط الرئيسية:**\n1. وجود أدلة وثائقية قوية لصالح العميل\n2. حاجة لمزيد من الشهادات لتعزيز الموقف\n3. يجب الاستعداد للدفاع على المادة الثانية من العقد'],
  [['صياغة', 'draft', 'write', 'كتابة'], 'أقترح صياغة المستند التالي:\n\n**مذكرة دفاع مقترحة:**\n\nبسم الله الرحمن الرحيم\n\nالموضوع: مذكرة دفاع في الدعوى رقم [...]\n\nنود إفادة المحكمة الموقرة بأن موكلنا قد قام بتنفيذ كافة التزاماته التعاقدية وفقاً للمادة [...] من العقد المبرم بتاريخ [...].\n\n**المطالب:**\n1. رفض الدعوى لعدم قيامها على سند قانوني\n2. الحكم للمدعى عليه بالمصاريف وأتعاب المحاماة\n\nنرجو من المحكمة الموقرة التكرم بالقبول.'],
  [['خطر', 'risk', 'analyze', 'تحليل', 'مخاطر'], 'تحليل المخاطر للقضية يشير إلى:\n\n**مخاطر عالية (🔴):**\n- احتمال رفض بعض الشهادات بسبب الإجراءات الشكلية\n- تقادم جزئي لبعض المطالبات\n\n**مخاطر متوسطة (🟡):**\n- اختلاف في تفسير بنود العقد\n- احتمال تأجيل الجلسات\n\n**مخاطر منخفضة (🟢):**\n- قوة الأدلة المقدمة من جانبنا\n- سابقة قضائية مؤيدة\n\n**التوصية:** التركيز على تعزيز الأدلة الوثائقية وتقديم شهادة الخبير المالي.'],
  [['استراتيج', 'strategy', 'suggest', 'اقتراح'], 'الاستراتيجية المقترحة تتضمن:\n\n**المرحلة الأولى: التحضير**\n- جمع وتنظيم كافة المستندات المؤيدة\n- مقابلة الشهود وتجهيز إفاداتهم\n- تعيين خبير مالي إذا لزم الأمر\n\n**المرحلة الثانية: المناصفة**\n- تقديم مذكرة دفاع شاملة\n- طلب تأجيل للرد على أدلة الطرف الآخر\n- التفاوض على تسوية ودية كخيار بديل\n\n**المرحلة الثالثة: المحاكمة**\n- تقديم المرافعة الختامية\n- التركيز على نقاط القوة في القضية\n- طلب تعويضات شاملة'],
];

const DEFAULT_RESPONSE = 'شكراً لسؤالك. بناءً على المعلومات المتاحة، يمكنني مساعدتك في:\n\n- تحليل مستندات القضية وتلخيصها\n- صياغة المذكرات والعقود القانونية\n- تقييم المخاطر وتحليل فرص النجاح\n- اقتراح استراتيجيات قانونية\n\nيرجى تقديم المزيد من التفاصيل لأساعدك بشكل أفضل.';

const DEFAULT_RESPONSE_EN = 'Thank you for your question. Based on the available information, I can help you with:\n\n- Analyzing and summarizing case documents\n- Drafting legal memoranda and contracts\n- Risk assessment and success probability analysis\n- Suggesting legal strategies\n\nPlease provide more details for better assistance.';

function getAIResponse(message: string, lang: string): string {
  const lower = message.toLowerCase();
  for (const [keywords, response] of KEYWORD_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return response;
    }
  }
  return lang === 'ar' ? DEFAULT_RESPONSE : DEFAULT_RESPONSE_EN;
}

const RECENT_CHATS = [
  'ملخص قضية التجارة الدولية',
  'صياغة عقد وكالة',
  'تحليل مخاطر القضية 2024-045',
  'استراتيجية الدفاع - القضية التجارية',
];

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-emerald-500"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AIAssistantView() {
  const { language, cases } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content:
        language === 'ar'
          ? 'مرحباً بك في المساعد القانوني الذكي. كيف يمكنني مساعدتك اليوم؟'
          : 'Welcome to the AI Legal Assistant. How can I help you today?',
      timestamp: new Date(),
    };
    return [welcome];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function sendMessage() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    const delay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const aiContent = getAIResponse(text, lang);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  }

  function handleQuickAction(actionText: string) {
    setInput(actionText);
    textareaRef.current?.focus();
    setMobileSidebarOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const quickActions = [
    { key: 'summarize', icon: BookOpen, label: t('ai.summarize', lang), text: lang === 'ar' ? 'تلخيص القضية' : 'Summarize the case' },
    { key: 'draft', icon: FileText, label: t('ai.draft', lang), text: lang === 'ar' ? 'صياغة مستند دفاع' : 'Draft a defense document' },
    { key: 'analyze', icon: ShieldAlert, label: t('ai.analyze', lang), text: lang === 'ar' ? 'تحليل المخاطر' : 'Analyze risks' },
    { key: 'suggest', icon: Lightbulb, label: t('ai.suggest', lang), text: lang === 'ar' ? 'اقتراح استراتيجية' : 'Suggest a strategy' },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'}
          ${mobileSidebarOpen ? 'fixed inset-y-0 start-0 z-50 w-64' : ''}
          shrink-0 border-e bg-background transition-all duration-200 overflow-hidden
          hidden lg:flex flex-col
          ${mobileSidebarOpen ? '!flex' : ''}
        `}
      >
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
            </h3>
            <div className="space-y-1.5">
              {quickActions.map((action) => (
                <Button
                  key={action.key}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm h-9"
                  onClick={() => handleQuickAction(action.text)}
                >
                  <action.icon className="size-4 text-emerald-600" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recent Chats */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {lang === 'ar' ? 'المحادثات الأخيرة' : 'Recent Chats'}
            </h3>
            <div className="space-y-1">
              {RECENT_CHATS.map((chat, i) => (
                <button
                  key={i}
                  className="w-full text-start px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors truncate"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  {chat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0 size-8"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="size-4" />
            </Button>

            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex shrink-0 size-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {isRtl ? (
                sidebarOpen ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />
              ) : (
                sidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />
              )}
            </Button>

            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="size-5 text-emerald-600 shrink-0" />
              <h1 className="font-semibold text-foreground truncate">
                {t('ai.title', lang)}
              </h1>
            </div>
          </div>

          {/* Case Select */}
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger className="w-48 max-w-[40vw]">
              <SelectValue placeholder={t('nav.cases', lang)} />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.caseNumber} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-h-[calc(100vh-12rem)] py-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-ee-md'
                        : 'bg-muted text-foreground rounded-es-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-2xl rounded-es-md">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 size-9 text-muted-foreground"
              disabled
            >
              <Paperclip className="size-4" />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.placeholder', lang)}
                className="resize-none min-h-[40px] max-h-[120px] pr-12"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white size-9 rounded-full"
              size="icon"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

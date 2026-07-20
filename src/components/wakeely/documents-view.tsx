'use client';

import { useEffect, useState } from 'react';
import { useAppStore, type DocumentItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Search,
  Filter,
  File,
  FileImage,
  FileSpreadsheet,
  MoreHorizontal,
  Trash2,
  Download,
  Eye,
  Plus,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function getDocIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
      return <FileText className="w-8 h-8 text-rose-500" />;
    case 'doc':
      return <FileText className="w-8 h-8 text-blue-500" />;
    case 'image':
      return <FileImage className="w-8 h-8 text-emerald-500" />;
    case 'spreadsheet':
      return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
    default:
      return <File className="w-8 h-8 text-slate-400" />;
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    pleading: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    evidence: 'bg-amber-50 text-amber-700 border-amber-200',
    correspondence: 'bg-sky-50 text-sky-700 border-sky-200',
    contract: 'bg-purple-50 text-purple-700 border-purple-200',
    court_order: 'bg-rose-50 text-rose-700 border-rose-200',
    general: 'bg-slate-100 text-slate-600 border-slate-200',
    other: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return colors[category] || colors.general;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsView() {
  const { language, cases } = useAppStore();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    fileName: '',
    fileType: 'pdf',
    category: 'general',
    description: '',
    caseId: '',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setLoading(true);
    try {
      // Fetch all documents by getting all cases with documents
      const res = await fetch('/api/cases?limit=100');
      const data = await res.json();
      const allDocs: DocumentItem[] = [];
      (data.cases || []).forEach((c: any) => {
        if (c.documents) {
          c.documents.forEach((d: DocumentItem) => {
            allDocs.push({ ...d, caseTitle: c.title, caseNumber: c.caseNumber });
          });
        }
      });
      setDocuments(allDocs);
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setLoading(false);
    }
  }

  const filtered = documents.filter((doc) => {
    const matchSearch =
      !search ||
      doc.fileName.toLowerCase().includes(search.toLowerCase()) ||
      doc.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = ['all', 'pleading', 'evidence', 'correspondence', 'contract', 'court_order', 'general', 'other'];

  async function handleSubmit() {
    if (!formData.fileName.trim() || !formData.caseId) {
      toast.error(language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
      return;
    }
    try {
      const res = await fetch(`/api/cases/${formData.caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Document added: ${formData.fileName}`,
        }),
      });
      setDialogOpen(false);
      setFormData({ fileName: '', fileType: 'pdf', category: 'general', description: '', caseId: '' });
      toast.success(t('documents.uploadSuccess', language));
      loadDocuments();
    } catch {
      toast.error(t('common.error', language));
    }
  }

  const isRtl = language === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('documents.title', language)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} {language === 'ar' ? 'مستند' : 'documents'}
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Upload className="w-4 h-4 me-2" />
          {t('documents.upload', language)}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={t('action.search', language)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${isRtl ? 'pr-10' : 'pl-10'}`}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? t('common.all', language) : t(`docCategory.${cat}`, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('documents.noDocuments', language)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-slate-50">{getDocIcon(doc.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{doc.fileName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(doc as any).caseNumber} · {(doc as any).caseTitle}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[10px] ${getCategoryColor(doc.category)}`}>
                        {t(`docCategory.${doc.category}`, language)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(doc.uploadedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('documents.upload', language)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('documents.fileName', language)} *</Label>
              <Input
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                placeholder={language === 'ar' ? 'مثال: لائحة دعوى.pdf' : 'e.g. complaint.pdf'}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('documents.fileType', language)}</Label>
                <Select value={formData.fileType} onValueChange={(v) => setFormData({ ...formData, fileType: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('documents.category', language)}</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'all').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`docCategory.${cat}`, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t('cases.title', language)} *</Label>
              <Select value={formData.caseId} onValueChange={(v) => setFormData({ ...formData, caseId: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={language === 'ar' ? 'اختر قضية' : 'Select a case'} />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('cases.description', language)}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('action.cancel', language)}
            </Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {t('action.submit', language)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
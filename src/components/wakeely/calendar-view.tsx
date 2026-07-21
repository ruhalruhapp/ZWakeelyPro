'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  location?: string;
  color?: string;
  reminder?: string;
  caseId?: string;
  createdAt: string;
  updatedAt: string;
  case?: { id: string; caseNumber: string; title: string } | null;
  _isCaseDate?: boolean;
}

const EVENT_TYPES = [
  'hearing',
  'filing',
  'meeting',
  'deadline',
  'trial',
  'deposition',
  'mediation',
] as const;

const EVENT_TYPE_COLORS: Record<string, string> = {
  hearing: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  filing: 'bg-amber-100 text-amber-700 border-amber-200',
  meeting: 'bg-sky-100 text-sky-700 border-sky-200',
  deadline: 'bg-rose-100 text-rose-700 border-rose-200',
  trial: 'bg-purple-100 text-purple-700 border-purple-200',
  deposition: 'bg-orange-100 text-orange-700 border-orange-200',
  mediation: 'bg-teal-100 text-teal-700 border-teal-200',
};

const EVENT_DOT_COLORS: Record<string, string> = {
  hearing: 'bg-emerald-500',
  filing: 'bg-amber-500',
  meeting: 'bg-sky-500',
  deadline: 'bg-rose-500',
  trial: 'bg-purple-500',
  deposition: 'bg-orange-500',
  mediation: 'bg-teal-500',
};

const REMINDER_OPTIONS = ['none', '5min', '15min', '30min', '1h', '1d'] as const;

const ARABIC_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Calendar View ──────────────────────────────────────────────────────────

export function CalendarView() {
  const { language, cases } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Add event dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'hearing',
    startDate: '',
    endDate: '',
    allDay: true,
    location: '',
    reminder: '15min',
    caseId: '',
  });

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/calendar?month=${currentMonth + 1}&year=${currentYear}`,
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? []);
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, lang]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigate months
  function prevMonth() {
    const d = subMonths(new Date(currentYear, currentMonth), 1);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    setSelectedDate(null);
  }

  function nextMonth() {
    const d = addMonths(new Date(currentYear, currentMonth), 1);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    setSelectedDate(null);
  }

  function goToday() {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  }

  // Calendar grid
  const monthStart = startOfMonth(new Date(currentYear, currentMonth));
  const monthEnd = endOfMonth(new Date(currentYear, currentMonth));
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to fill grid (Sat-Fri for Arabic, Sun-Sat for English)
  function getDayOfWeekIndex(date: Date): number {
    const day = date.getDay(); // 0=Sun ... 6=Sat
    if (isRtl) {
      // Arabic: Sat=0, Sun=1, ..., Fri=6
      return day === 6 ? 0 : day + 1;
    }
    return day;
  }

  const startPadDays = getDayOfWeekIndex(monthStart);

  // Build grid rows
  const gridDays: (Date | null)[] = [];
  for (let i = 0; i < startPadDays; i++) {
    gridDays.push(null);
  }
  for (const day of daysInMonth) {
    gridDays.push(day);
  }
  // Pad to fill complete rows
  while (gridDays.length % 7 !== 0) {
    gridDays.push(null);
  }

  const dayHeaders = isRtl ? ARABIC_DAYS : ENGLISH_DAYS;

  // Events for a specific day
  function getEventsForDay(date: Date): CalendarEvent[] {
    return events.filter((e) => {
      try {
        const eventDate = parseISO(e.startDate);
        return isSameDay(eventDate, date);
      } catch {
        return false;
      }
    });
  }

  // Selected day events
  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Create event
  async function handleCreateEvent() {
    if (!newEvent.title.trim() || !newEvent.startDate) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || undefined,
        eventType: newEvent.eventType,
        startDate: new Date(newEvent.startDate).toISOString(),
        allDay: newEvent.allDay,
        location: newEvent.location.trim() || undefined,
        reminder: newEvent.reminder === 'none' ? null : newEvent.reminder,
        caseId: newEvent.caseId || undefined,
      };
      if (newEvent.endDate) {
        payload.endDate = new Date(newEvent.endDate).toISOString();
      }
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setEvents((prev) => [...prev, created]);
        setDialogOpen(false);
        setNewEvent({
          title: '',
          description: '',
          eventType: 'hearing',
          startDate: '',
          endDate: '',
          allDay: true,
          location: '',
          reminder: '15min',
          caseId: '',
        });
        toast.success(t('action.create', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  // Event detail panel content
  function EventDetailContent() {
    return (
      <div className="space-y-3">
        {selectedDayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {t('common.noResults', lang)}
          </p>
        ) : (
          selectedDayEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="overflow-hidden">
                <div
                  className={`h-1 ${
                    EVENT_DOT_COLORS[event.eventType] ?? 'bg-gray-400'
                  }`}
                />
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {event.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        EVENT_TYPE_COLORS[event.eventType] ?? ''
                      }`}
                    >
                      {t(`calendar.${event.eventType}`, lang)}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {!event.allDay && event.startDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {format(parseISO(event.startDate), 'h:mm a')}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.case && (
                    <p className="text-[11px] text-muted-foreground">
                      {event.case.caseNumber} — {event.case.title}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    );
  }

  // Month/year label
  const monthLabel = format(new Date(currentYear, currentMonth), 'MMMM yyyy');

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('calendar.title', lang)}
          </h1>
        </div>
        <Button
          onClick={() => {
            setDialogOpen(true);
            if (selectedDate) {
              setNewEvent((prev) => ({
                ...prev,
                startDate: format(selectedDate, 'yyyy-MM-dd'),
              }));
            }
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('action.create', lang)}
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            {isRtl ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
          <h2 className="text-lg font-semibold capitalize min-w-[180px] text-center">
            {monthLabel}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            {isRtl ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          {t('tasks.today', lang)}
        </Button>
      </div>

      {/* Calendar + Detail Panel Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar Grid */}
        <div className="flex-1">
          {loading ? (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-md" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-2 md:p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayHeaders.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 gap-1">
                  {gridDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="min-h-[72px] md:min-h-[88px]" />;
                    }

                    const dayEvents = getEventsForDay(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const today = isToday(day);
                    const inMonth = isSameMonth(day, monthStart);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative min-h-[72px] md:min-h-[88px] rounded-md p-1.5 md:p-2 text-left
                          transition-colors border
                          ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-transparent hover:bg-muted/50'
                          }
                          ${!inMonth ? 'opacity-40' : ''}
                        `}
                      >
                        <span
                          className={`
                            text-xs md:text-sm font-medium inline-flex items-center justify-center
                            size-6 rounded-full
                            ${today ? 'bg-emerald-600 text-white' : 'text-foreground'}
                          `}
                        >
                          {format(day, 'd')}
                        </span>

                        {/* Event dots/pills */}
                        <div className="mt-0.5 space-y-0.5 hidden sm:block">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center gap-1 truncate"
                            >
                              <span
                                className={`shrink-0 size-1.5 rounded-full ${
                                  EVENT_DOT_COLORS[ev.eventType] ?? 'bg-gray-400'
                                }`}
                              />
                              <span className="text-[10px] text-muted-foreground truncate">
                                {ev.allDay
                                  ? ev.title
                                  : `${format(parseISO(ev.startDate), 'h:mm a')} ${ev.title}`}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[10px] text-muted-foreground pl-3.5">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Mobile: just dots */}
                        <div className="mt-1 flex gap-0.5 sm:hidden">
                          {dayEvents.slice(0, 4).map((ev) => (
                            <span
                              key={ev.id}
                              className={`size-1.5 rounded-full ${
                                EVENT_DOT_COLORS[ev.eventType] ?? 'bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Event Detail Panel — Desktop */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block w-[320px] shrink-0"
            >
              <Card className="sticky top-4">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {format(selectedDate, 'EEEE, MMM d, yyyy')}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => setSelectedDate(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedDayEvents.length}{' '}
                    {selectedDayEvents.length === 1 ? 'event' : 'events'}
                  </p>
                </CardHeader>
                <Separator />
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-3 space-y-2">
                    <EventDetailContent />
                  </div>
                </ScrollArea>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Detail Panel — Mobile (Sheet) */}
      <Sheet
        open={!!selectedDate}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
      >
        <SheetContent side={isRtl ? 'left' : 'right'} className="w-[85vw] max-w-sm p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-sm font-semibold">
              {selectedDate && format(selectedDate, 'EEEE, MMM d, yyyy')}
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              {selectedDayEvents.length}{' '}
              {selectedDayEvents.length === 1 ? 'event' : 'events'}
            </p>
          </SheetHeader>
          <Separator />
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-3">
              <EventDetailContent />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Add Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('action.create', lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('tasks.taskTitle', lang)}</Label>
              <Input
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t('tasks.taskTitle', lang)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('cases.description', lang)}</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('common.type', lang)}</Label>
                <Select
                  value={newEvent.eventType}
                  onValueChange={(v) =>
                    setNewEvent((prev) => ({ ...prev, eventType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((et) => (
                      <SelectItem key={et} value={et}>
                        {t(`calendar.${et}`, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('calendar.reminder', lang)}</Label>
                <Select
                  value={newEvent.reminder}
                  onValueChange={(v) =>
                    setNewEvent((prev) => ({ ...prev, reminder: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r === 'none'
                          ? t('common.none', lang)
                          : r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('common.date', lang)}</Label>
                <Input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={newEvent.allDay}
                onCheckedChange={(checked) =>
                  setNewEvent((prev) => ({ ...prev, allDay: !!checked }))
                }
              />
              <Label>All Day</Label>
            </div>
            <div className="space-y-2">
              <Label>{t('calendar.location', lang)}</Label>
              <Input
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder={t('calendar.location', lang)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('cases.caseTitle', lang)}</Label>
              <Select
                value={newEvent.caseId}
                onValueChange={(v) =>
                  setNewEvent((prev) => ({ ...prev, caseId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.none', lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('common.none', lang)}</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} – {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('action.cancel', lang)}
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={!newEvent.title.trim() || !newEvent.startDate || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {t('action.submit', lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
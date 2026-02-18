import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Clock, BookOpen, ClipboardList, Stethoscope, Trash2, Edit2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'prova' | 'estudo' | 'clinica' | 'revisao' | 'outro';
  description?: string;
  subject?: string;
}

const eventTypeConfig = {
  prova: { label: 'Prova', color: 'bg-red-500', icon: ClipboardList },
  estudo: { label: 'Estudo', color: 'bg-blue-500', icon: BookOpen },
  clinica: { label: 'Clínica', color: 'bg-green-500', icon: Stethoscope },
  revisao: { label: 'Revisão', color: 'bg-yellow-500', icon: Clock },
  outro: { label: 'Outro', color: 'bg-gray-500', icon: Calendar },
};

const Agenda = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Prova de Cardiologia',
      date: addDays(new Date(), 2),
      time: '14:00',
      type: 'prova',
      subject: 'Cardiologia',
    },
    {
      id: '2',
      title: 'Revisão de Flashcards',
      date: new Date(),
      time: '10:00',
      type: 'revisao',
      subject: 'Farmacologia',
    },
    {
      id: '3',
      title: 'Plantão Clínico',
      date: addDays(new Date(), 1),
      time: '08:00',
      type: 'clinica',
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'estudo' as Event['type'],
    description: '',
    subject: '',
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleAddEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: new Date(newEvent.date),
      time: newEvent.time,
      type: newEvent.type,
      description: newEvent.description,
      subject: newEvent.subject,
    };
    setEvents([...events, event]);
    setIsDialogOpen(false);
    setNewEvent({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      type: 'estudo',
      description: '',
      subject: '',
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const getEventsForDay = (date: Date) => {
    return events.filter((e) => isSameDay(e.date, date));
  };

  const upcomingEvents = events
    .filter((e) => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">Agenda</h1>
            <p className="text-muted-foreground mt-1">Organize seus estudos e compromissos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Nome do evento"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value: Event['type']) => setNewEvent({ ...newEvent, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Matéria (opcional)</Label>
                  <Input
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                    placeholder="Ex: Cardiologia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Detalhes do evento..."
                  />
                </div>
                <Button onClick={handleAddEvent} className="w-full" disabled={!newEvent.title}>
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Week View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Semana de {format(weekStart, "d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedDate(day)}
                      className={`p-3 rounded-lg cursor-pointer transition-all min-h-[120px] ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isToday
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs uppercase opacity-70">
                          {format(day, 'EEE', { locale: ptBR })}
                        </p>
                        <p className="text-lg font-bold">{format(day, 'd')}</p>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded ${eventTypeConfig[event.type].color} text-white truncate`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs opacity-70 text-center">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum evento próximo</p>
              ) : (
                upcomingEvents.map((event, index) => {
                  const config = eventTypeConfig[event.type];
                  const IconComponent = config.icon;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg group"
                    >
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(event.date, "d 'de' MMM", { locale: ptBR })} às {event.time}
                        </p>
                        {event.subject && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {event.subject}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              Eventos em {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDay(selectedDate).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum evento para este dia</p>
            ) : (
              <div className="space-y-3">
                {getEventsForDay(selectedDate).map((event) => {
                  const config = eventTypeConfig[event.type];
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border"
                    >
                      <div className={`p-3 rounded-xl ${config.color}`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <Badge variant="outline">{config.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {event.time}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Agenda;

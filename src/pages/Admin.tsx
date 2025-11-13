import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Booking {
  id: number;
  booking_date: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  service_type: string;
  status: string;
  created_at: string;
}

interface Reminder {
  id: number;
  booking_id: number | null;
  reminder_type: string;
  reminder_text: string;
  send_at: string;
  sent: boolean;
  sent_at: string | null;
  client_email: string;
  client_phone: string;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState({
    booking_id: '',
    reminder_type: 'email',
    reminder_text: '',
    send_at: '',
    client_email: '',
    client_phone: ''
  });
  const { toast } = useToast();

  const ADMIN_PASSWORD = 'photographer2024';
  const BOOKINGS_URL = 'https://functions.poehali.dev/eacda22c-e30e-4f3f-b8b3-45568f052309';
  const REMINDERS_URL = 'https://functions.poehali.dev/ff088d4b-9902-4e3e-a1e5-2faf848a52b4';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchBookings();
      fetchReminders();
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const fetchBookings = async () => {
    const response = await fetch(BOOKINGS_URL, {
      headers: {
        'X-Admin-Password': ADMIN_PASSWORD
      }
    });
    const data = await response.json();
    if (data.bookings) {
      setBookings(data.bookings);
    }
  };

  const fetchReminders = async () => {
    const response = await fetch(REMINDERS_URL, {
      headers: {
        'X-Admin-Password': ADMIN_PASSWORD
      }
    });
    const data = await response.json();
    if (data.reminders) {
      setReminders(data.reminders);
    }
  };

  const createReminder = async () => {
    if (!newReminder.reminder_text || !newReminder.send_at) {
      toast({
        title: 'Ошибка',
        description: 'Заполните текст и время отправки',
        variant: 'destructive'
      });
      return;
    }

    const response = await fetch(REMINDERS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': ADMIN_PASSWORD
      },
      body: JSON.stringify({
        ...newReminder,
        booking_id: newReminder.booking_id ? parseInt(newReminder.booking_id) : null
      })
    });

    if (response.ok) {
      toast({
        title: 'Успешно',
        description: 'Напоминание создано'
      });
      setNewReminder({
        booking_id: '',
        reminder_type: 'email',
        reminder_text: '',
        send_at: '',
        client_email: '',
        client_phone: ''
      });
      fetchReminders();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Админ-панель</CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button className="w-full" onClick={handleLogin}>
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Админ-панель</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Бронирования</CardTitle>
              <CardDescription>Все заявки на съёмку</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground">Пока нет бронирований</p>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{booking.client_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.service_type}</p>
                          <p className="text-sm">📅 {new Date(booking.booking_date).toLocaleDateString('ru-RU')}</p>
                          <p className="text-sm">📞 {booking.client_phone}</p>
                          <p className="text-sm">✉️ {booking.client_email}</p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Напоминания</CardTitle>
              <CardDescription>Запланированные уведомления</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reminders.length === 0 ? (
                  <p className="text-muted-foreground">Нет запланированных напоминаний</p>
                ) : (
                  reminders.map((reminder) => (
                    <div key={reminder.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{reminder.reminder_text}</p>
                          <p className="text-xs text-muted-foreground">
                            📅 {new Date(reminder.send_at).toLocaleString('ru-RU')}
                          </p>
                          <p className="text-xs">✉️ {reminder.client_email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          reminder.sent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reminder.sent ? 'Отправлено' : 'Ожидает'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Создать напоминание</CardTitle>
            <CardDescription>Запланируйте автоматическое уведомление для клиента</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="booking_id">ID бронирования (необязательно)</Label>
                <Input
                  id="booking_id"
                  type="number"
                  value={newReminder.booking_id}
                  onChange={(e) => setNewReminder({ ...newReminder, booking_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="reminder_type">Тип уведомления</Label>
                <select
                  id="reminder_type"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newReminder.reminder_type}
                  onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value })}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="reminder_text">Текст напоминания</Label>
                <Textarea
                  id="reminder_text"
                  value={newReminder.reminder_text}
                  onChange={(e) => setNewReminder({ ...newReminder, reminder_text: e.target.value })}
                  placeholder="Напоминаем о вашей фотосессии завтра в 14:00..."
                />
              </div>
              <div>
                <Label htmlFor="send_at">Дата и время отправки</Label>
                <Input
                  id="send_at"
                  type="datetime-local"
                  value={newReminder.send_at}
                  onChange={(e) => setNewReminder({ ...newReminder, send_at: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client_email">Email клиента</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={newReminder.client_email}
                  onChange={(e) => setNewReminder({ ...newReminder, client_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="client_phone">Телефон клиента</Label>
                <Input
                  id="client_phone"
                  type="tel"
                  value={newReminder.client_phone}
                  onChange={(e) => setNewReminder({ ...newReminder, client_phone: e.target.value })}
                />
              </div>
            </div>
            <Button className="mt-6 w-full" onClick={createReminder}>
              Создать напоминание
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;

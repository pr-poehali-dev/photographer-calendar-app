import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [activeSection, setActiveSection] = useState('home');
  const { toast } = useToast();

  const portfolioImages = [
    'https://cdn.poehali.dev/projects/1a2ac40f-ddb0-47ca-ab3b-aba9eccf6eca/files/aeb74b84-dd41-478d-9177-18ed8c3f671e.jpg',
    'https://cdn.poehali.dev/projects/1a2ac40f-ddb0-47ca-ab3b-aba9eccf6eca/files/a16024f9-ee8c-408d-b740-49b17c1244be.jpg',
    'https://cdn.poehali.dev/projects/1a2ac40f-ddb0-47ca-ab3b-aba9eccf6eca/files/2807f8da-2123-4136-a917-fdcda14176e0.jpg',
  ];

  const services = [
    {
      title: 'Свадебная съёмка',
      description: 'Полный день съёмки: сборы, церемония, прогулка, банкет',
      price: 'от 50 000 ₽',
      icon: 'Heart'
    },
    {
      title: 'Портретная съёмка',
      description: 'Индивидуальная или семейная фотосессия',
      price: 'от 15 000 ₽',
      icon: 'Camera'
    },
    {
      title: 'Love Story',
      description: 'Романтическая фотосессия для пары',
      price: 'от 20 000 ₽',
      icon: 'Users'
    }
  ];

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBooking = async () => {
    if (!date) {
      toast({
        title: 'Выберите дату',
        description: 'Пожалуйста, выберите дату съёмки',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/eacda22c-e30e-4f3f-b8b3-45568f052309', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_date: date.toISOString().split('T')[0],
          client_name: 'Клиент из формы',
          client_phone: '+7 (900) 123-45-67',
          client_email: 'client@example.com',
          service_type: 'Фотосессия'
        })
      });

      if (response.ok) {
        toast({
          title: 'Заявка отправлена!',
          description: `Вы выбрали дату: ${date.toLocaleDateString('ru-RU')}. Я свяжусь с вами в ближайшее время.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Фотограф</h1>
            <div className="hidden md:flex gap-8">
              {['home', 'services', 'portfolio', 'about', 'booking', 'contacts'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm transition-colors hover:text-primary ${
                    activeSection === section ? 'text-primary font-semibold' : 'text-foreground'
                  }`}
                >
                  {section === 'home' && 'Главная'}
                  {section === 'services' && 'Услуги'}
                  {section === 'portfolio' && 'Портфолио'}
                  {section === 'about' && 'Обо мне'}
                  {section === 'booking' && 'Бронирование'}
                  {section === 'contacts' && 'Контакты'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section id="home" className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Создаю эмоции,<br />которые останутся навсегда
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Профессиональная фотосъёмка для ваших особенных моментов
          </p>
          <Button size="lg" onClick={() => scrollToSection('booking')} className="animate-scale-in">
            Забронировать съёмку
          </Button>
        </div>
      </section>

      <section id="portfolio" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Портфолио</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolioImages.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square overflow-hidden rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Portfolio ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Услуги и пакеты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name={service.icon as any} className="text-primary" size={24} />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-8">Обо мне</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Привет! Я профессиональный фотограф с опытом работы более 7 лет. 
            Для меня фотография — это искусство запечатлеть настоящие эмоции 
            и создать воспоминания, которые будут радовать вас долгие годы.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Каждая съёмка — это уникальная история, и я делаю всё, чтобы 
            передать атмосферу вашего особенного дня через объектив камеры.
          </p>
        </div>
      </section>

      <section id="booking" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-center">Бронирование</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Выберите дату съёмки</h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Прайс-лист</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Свадебная съёмка (полный день)</span>
                    <span className="font-semibold">50 000 ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Портретная съёмка (2 часа)</span>
                    <span className="font-semibold">15 000 ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Love Story (1,5 часа)</span>
                    <span className="font-semibold">20 000 ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span>Семейная съёмка (1 час)</span>
                    <span className="font-semibold">12 000 ₽</span>
                  </div>
                </div>
              </div>
              <Button size="lg" className="mt-8" onClick={handleBooking}>
                Отправить заявку
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-8">Контакты</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Icon name="Phone" size={24} className="text-primary" />
              <a href="tel:+79001234567" className="text-lg hover:text-primary transition-colors">
                +7 (900) 123-45-67
              </a>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Icon name="Mail" size={24} className="text-primary" />
              <a href="mailto:photo@example.com" className="text-lg hover:text-primary transition-colors">
                photo@example.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Icon name="Instagram" size={24} className="text-primary" />
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-primary transition-colors">
                @photographer
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2024 Фотограф. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
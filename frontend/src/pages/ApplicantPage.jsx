/**
 * Страница абитуриента — лендинг с информацией о поступлении
 * Данные загружаются из /api/applicant-content (можно редактировать в админке)
 * @module pages/ApplicantPage
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School,
  EventAvailable,
  Description,
  CheckCircle,
  Phone,
  Email,
  LocationOn,
  Schedule,
  ExpandMore,
  HowToReg,
  Business,
  LocalLibrary,
  Science,
  Computer,
  Calculate,
  Security,
  Groups,
  SportsBasketball,
  Restaurant,
  Home,
  ErrorOutline,
} from '@mui/icons-material';
import { getApplicantContent } from '../api/applicantContent';

const ICONS = {
  Информатика: <Computer />,
  Математика: <Calculate />,
  Физика: <Science />,
  Безопасность: <Security />,
  Бизнес: <Business />,
  Библиотека: <LocalLibrary />,
  Наука: <Science />,
  Группы: <Groups />,
  Спорт: <SportsBasketball />,
  Питание: <Restaurant />,
  Дом: <Home />,
};

const DEFAULT_CONTENT = {
  heroBadge: 'Приёмная кампания 2026',
  heroTitle: 'Поступай в Институт точных наук',
  heroSubtitle: 'Цифровых технологий АГУ',
  heroDescription:
    'Современное IT-образование с углублённым изучением математики, физики и информационных технологий. Диплом государственного образца, общежитие, стажировки в ведущих IT-компаниях.',
  contactAddress: 'г. Москва, ул. Университетская, д. 1, каб. 215',
  contactPhone: '+7 (495) 123-45-67',
  contactEmail: 'admissions@faculty-agu.ru',
  contactHours: 'Пн–Пт: 9:00–17:00, Сб: 10:00–14:00',
  admissionYear: 2026,
  stats: [
    { value: '95%', label: 'Трудоустройство выпускников' },
    { value: '4.6', label: 'Средний балл ЕГЭ' },
    { value: '60+', label: 'Бюджетных мест' },
    { value: '15', label: 'IT-партнёров' },
  ],
  programs: [
    { code: '09.03.01', name: 'Информатика и вычислительная техника', level: 'Бакалавриат', duration: '4 года', places: 25, exams: ['Математика (профиль)', 'Информатика', 'Русский язык'] },
    { code: '01.03.02', name: 'Прикладная математика и информатика', level: 'Бакалавриат', duration: '4 года', places: 20, exams: ['Математика (профиль)', 'Информатика', 'Русский язык'] },
    { code: '03.03.02', name: 'Физика', level: 'Бакалавриат', duration: '4 года', places: 15, exams: ['Физика', 'Математика (профиль)', 'Русский язык'] },
    { code: '10.03.01', name: 'Информационная безопасность', level: 'Бакалавриат', duration: '4 года', places: 20, exams: ['Математика (профиль)', 'Информатика', 'Русский язык'] },
    { code: '09.04.01', name: 'Информатика и вычислительная техника', level: 'Магистратура', duration: '2 года', places: 10, exams: ['Междисциплинарный экзамен', 'Собеседование'] },
    { code: '01.04.02', name: 'Прикладная математика и информатика', level: 'Магистратура', duration: '2 года', places: 8, exams: ['Междисциплинарный экзамен', 'Собеседование'] },
  ],
  timeline: [
    { label: '20 июня', desc: 'Начало приёма документов' },
    { label: '25 июля', desc: 'Завершение приёма документов (бюджет, очная форма)' },
    { label: '27–30 июля', desc: 'Вступительные испытания' },
    { label: '2 августа', desc: 'Публикация конкурсных списков' },
    { label: '4–6 августа', desc: 'Приоритетное зачисление (льготники, целевики)' },
    { label: '6–8 августа', desc: 'Основной этап зачисления' },
    { label: '1 сентября', desc: 'Начало учебного года' },
  ],
  documents: [
    { name: 'Паспорт гражданина РФ (копия)', required: true },
    { name: 'Аттестат о среднем общем образовании (копия)', required: true },
    { name: 'СНИЛС (копия)', required: true },
    { name: 'Фотографии 3×4 см (4 шт.)', required: true },
    { name: 'Медицинская справка формы 086/у', required: true },
    { name: 'Документы, подтверждающие индивидуальные достижения', required: false },
    { name: 'Договор о целевом обучении (при наличии)', required: false },
    { name: 'Справка об установлении инвалидности (при наличии)', required: false },
  ],
  dormFeatures: [
    { text: 'Комнаты на 2–3 человека' },
    { text: 'Кухня и столовая на этаже' },
    { text: 'Читальный зал и Wi-Fi' },
    { text: 'Спортивный зал' },
  ],
  dormCost: 'от 800 ₽/мес',
  dormAddress: 'ул. Студенческая, д. 5 (5 мин от института)',
  dormDescription:
    'Для всех иногородних студентов очной формы обучения предоставляется место в комфортабельном общежитии. На территории — всё необходимое для учёбы и отдыха.',
  benefits: [
    { title: 'IT-партнёры', text: 'Стажировки и трудоустройство в Яндекс, VK, Сбер, Тинькофф' },
    { title: 'Малые группы', text: 'До 15 человек на семинаре — индивидуальный подход' },
    { title: 'Современная база', text: '4 компьютерных класса, лаборатория робототехники, научный центр' },
    { title: 'Научная работа', text: 'Публикации, гранты РФФИ, участие в конференциях со 2 курса' },
  ],
  faq: [
    { q: 'Какие минимальные баллы ЕГЭ для поступления?', a: 'Математика (профиль) — 39, Информатика — 44, Физика — 39, Русский язык — 40.' },
    { q: 'Есть ли целевые направления?', a: 'Да, мы сотрудничаем с IT-компаниями, образовательными учреждениями и государственными организациями.' },
    { q: 'Предоставляется ли общежитие иногородним?', a: 'Да, всем иногородним студентам-очникам предоставляется место в общежитии.' },
    { q: 'Есть ли военный учёт и отсрочка?', a: 'Институт имеет военный учёт. Студентам очной формы обучения предоставляется отсрочка от армии.' },
    { q: 'Какие индивидуальные достижения дают дополнительные баллы?', a: 'Золотая медаль — 5 баллов, значок ГТО — 1–2 балла, итоговое сочинение — 1 балл, победы в олимпиадах — до 10 баллов.' },
  ],
};

const ICON_KEYS = ['Информатика', 'Математика', 'Физика', 'Безопасность', 'Бизнес', 'Библиотека', 'Наука', 'Группы', 'Спорт', 'Питание', 'Дом'];

function pickProgramIcon(program, idx) {
  if (program.code?.startsWith('09')) return <Computer />;
  if (program.code?.startsWith('01')) return <Calculate />;
  if (program.code?.startsWith('03')) return <Science />;
  if (program.code?.startsWith('10')) return <Security />;
  return ICON_KEYS[idx % ICON_KEYS.length] ? ICONS[ICON_KEYS[idx % ICON_KEYS.length]] : <Computer />;
}

function pickBenefitIcon(idx) {
  return ICONS[ICON_KEYS[idx % ICON_KEYS.length]] || <Business />;
}

function ApplicantPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getApplicantContent();
        if (!cancelled && data) setContent({ ...DEFAULT_CONTENT, ...data });
      } catch (e) {
        if (!cancelled) setLoadError('Не удалось загрузить актуальный контент. Показаны данные по умолчанию.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const c = content;
  const contacts = [
    { icon: <LocationOn />, title: 'Адрес', value: c.contactAddress },
    { icon: <Phone />, title: 'Телефон', value: c.contactPhone },
    { icon: <Email />, title: 'Email', value: c.contactEmail },
    { icon: <Schedule />, title: 'Часы работы', value: c.contactHours },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loadError && (
        <Alert severity="info" icon={<ErrorOutline />} sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip label={c.heroBadge} color="warning" sx={{ mb: 2, fontWeight: 'bold' }} />
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            {c.heroTitle}
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.95 }}>
            {c.heroSubtitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 700, opacity: 0.9 }}>
            {c.heroDescription}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<HowToReg />}
              href={`mailto:${c.contactEmail}`}
            >
              Подать заявку
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Description />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Скачать брошюру
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {(c.stats || []).map((stat, idx) => (
          <Grid item xs={6} md={3} key={idx}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Направления подготовки */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Направления подготовки
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Бакалавриат и магистратура по востребованным IT- и инженерным специальностям
        </Typography>
        <Grid container spacing={3}>
          {(c.programs || []).map((program, idx) => (
            <Grid item xs={12} md={6} lg={4} key={`${program.code}-${program.level}-${idx}`}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {pickProgramIcon(program, idx)}
                    </Avatar>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        {program.code}
                      </Typography>
                      <Typography variant="h6" component="div" fontWeight="bold">
                        {program.level}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                    {program.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
                    <Chip size="small" label={program.duration} />
                    <Chip size="small" label={`${program.places} мест`} color="primary" />
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    ВСТУПИТЕЛЬНЫЕ ИСПЫТАНИЯ
                  </Typography>
                  <List dense disablePadding>
                    {(program.exams || []).map((exam) => (
                      <ListItem key={exam} disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircle fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={exam} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth variant="outlined">
                    Подробнее
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Сроки приёма */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <EventAvailable sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h2" fontWeight="bold">
            Сроки приёма {c.admissionYear}
          </Typography>
        </Box>
        <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
          {(c.timeline || []).map((item, idx) => (
            <Step key={idx} completed={idx < activeStep}>
              <StepLabel
                onClick={() => setActiveStep(idx)}
                sx={{ cursor: 'pointer' }}
                StepIconComponent={() => (
                  <Avatar
                    sx={{
                      bgcolor: idx <= activeStep ? 'primary.main' : 'grey.300',
                      width: 32,
                      height: 32,
                      fontSize: '0.9rem',
                    }}
                  >
                    {idx + 1}
                  </Avatar>
                )}
              >
                <Typography variant="h6" fontWeight="bold">
                  {item.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography color="text.secondary" sx={{ pb: 2 }}>
                  {item.desc}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Документы и общежитие */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Description sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h5" fontWeight="bold">
                Документы для поступления
              </Typography>
            </Box>
            <List>
              {(c.documents || []).map((doc, idx) => (
                <ListItem key={idx} divider={idx < c.documents.length - 1}>
                  <ListItemIcon>
                    {doc.required ? (
                      <CheckCircle color="error" />
                    ) : (
                      <CheckCircle color="disabled" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.name}
                    secondary={doc.required ? 'Обязательный' : 'При наличии'}
                    secondaryTypographyProps={{
                      color: doc.required ? 'error' : 'text.secondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Home sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h5" fontWeight="bold">
                Общежитие
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {c.dormDescription}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {(c.dormFeatures || []).map((feat, idx) => (
                <Grid item xs={6} key={idx}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5, width: 32, height: 32 }}>
                      <Home />
                    </Avatar>
                    <Typography variant="body2">{feat.text}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Стоимость:</strong> {c.dormCost}
              <br />
              <strong>Адрес:</strong> {c.dormAddress}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Преимущества */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Почему выбирают наш институт
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {(c.benefits || []).map((item, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  {pickBenefitIcon(idx)}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {item.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* FAQ */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Часто задаваемые вопросы
        </Typography>
        {(c.faq || []).map((item, idx) => (
          <Accordion key={idx} sx={{ '&:before': { display: 'none' }, mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Контакты */}
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Приёмная комиссия
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Свяжитесь с нами для консультации или подачи документов
        </Typography>
        <Grid container spacing={3}>
          {contacts.map((c, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{c.icon}</Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {c.title.toUpperCase()}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {c.value}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            startIcon={<HowToReg />}
            href={`mailto:${content.contactEmail}`}
            sx={{ mr: 2 }}
          >
            Подать заявку
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Phone />}
            href={`tel:${content.contactPhone?.replace(/[^\d+]/g, '')}`}
          >
            Позвонить
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ApplicantPage;

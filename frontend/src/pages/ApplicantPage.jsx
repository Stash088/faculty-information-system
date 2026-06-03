/**
 * Страница абитуриента — лендинг с информацией о поступлении
 * @module pages/ApplicantPage
 */

import React, { useState } from 'react';
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
} from '@mui/icons-material';

const programs = [
  {
    icon: <Computer />,
    code: '09.03.01',
    name: 'Информатика и вычислительная техника',
    level: 'Бакалавриат',
    duration: '4 года',
    places: 25,
    exams: ['Математика (профиль)', 'Информатика', 'Русский язык'],
  },
  {
    icon: <Calculate />,
    code: '01.03.02',
    name: 'Прикладная математика и информатика',
    level: 'Бакалавриат',
    duration: '4 года',
    places: 20,
    exams: ['Математика (профиль)', 'Информатика', 'Русский язык'],
  },
  {
    icon: <Science />,
    code: '03.03.02',
    name: 'Физика',
    level: 'Бакалавриат',
    duration: '4 года',
    places: 15,
    exams: ['Физика', 'Математика (профиль)', 'Русский язык'],
  },
  {
    icon: <Security />,
    code: '10.03.01',
    name: 'Информационная безопасность',
    level: 'Бакалавриат',
    duration: '4 года',
    places: 20,
    exams: ['Математика (профиль)', 'Информатика', 'Русский язык'],
  },
  {
    icon: <Computer />,
    code: '09.04.01',
    name: 'Информатика и вычислительная техника',
    level: 'Магистратура',
    duration: '2 года',
    places: 10,
    exams: ['Междисциплинарный экзамен', 'Собеседование'],
  },
  {
    icon: <Calculate />,
    code: '01.04.02',
    name: 'Прикладная математика и информатика',
    level: 'Магистратура',
    duration: '2 года',
    places: 8,
    exams: ['Междисциплинарный экзамен', 'Собеседование'],
  },
];

const documents = [
  { name: 'Паспорт гражданина РФ (копия)', required: true },
  { name: 'Аттестат о среднем общем образовании (копия)', required: true },
  { name: 'СНИЛС (копия)', required: true },
  { name: 'Фотографии 3×4 см (4 шт.)', required: true },
  { name: 'Медицинская справка формы 086/у', required: true },
  { name: 'Документы, подтверждающие индивидуальные достижения', required: false },
  { name: 'Договор о целевом обучении (при наличии)', required: false },
  { name: 'Справка об установлении инвалидности (при наличии)', required: false },
];

const timeline = [
  { label: '20 июня', desc: 'Начало приёма документов', date: '2026-06-20' },
  { label: '25 июля', desc: 'Завершение приёма документов (бюджет, очная форма)', date: '2026-07-25' },
  { label: '27–30 июля', desc: 'Вступительные испытания', date: '2026-07-27' },
  { label: '2 августа', desc: 'Публикация конкурсных списков', date: '2026-08-02' },
  { label: '4–6 августа', desc: 'Приоритетное зачисление (льготники, целевики)', date: '2026-08-04' },
  { label: '6–8 августа', desc: 'Основной этап зачисления', date: '2026-08-06' },
  { label: '1 сентября', desc: 'Начало учебного года', date: '2026-09-01' },
];

const dormFeatures = [
  { icon: <Home />, text: 'Комнаты на 2–3 человека' },
  { icon: <Restaurant />, text: 'Кухня и столовая на этаже' },
  { icon: <LocalLibrary />, text: 'Читальный зал и Wi-Fi' },
  { icon: <SportsBasketball />, text: 'Спортивный зал' },
];

const faq = [
  {
    q: 'Какие минимальные баллы ЕГЭ для поступления?',
    a: 'Математика (профиль) — 39, Информатика — 44, Физика — 39, Русский язык — 40. Для участия в конкурсе необходимо набрать минимальные баллы по каждому предмету.',
  },
  {
    q: 'Есть ли целевые направления?',
    a: 'Да, мы сотрудничаем с IT-компаниями, образовательными учреждениями и государственными организациями. Целевики зачисляются в первую очередь и получают стипендию от работодателя.',
  },
  {
    q: 'Предоставляется ли общежитие иногородним?',
    a: 'Да, всем иногородним студентам-очникам предоставляется место в общежитии. Стоимость проживания — от 800 ₽/мес.',
  },
  {
    q: 'Есть ли военный учёт и отсрочка?',
    a: 'Институт имеет военный учёт. Студентам очной формы обучения предоставляется отсрочка от армии на весь срок обучения (при наличии соответствующей отметки в приписном свидетельстве).',
  },
  {
    q: 'Какие индивидуальные достижения дают дополнительные баллы?',
    a: 'Золотая медаль — 5 баллов, значок ГТО — 1–2 балла, итоговое сочинение — 1 балл, победы в олимпиадах — до 10 баллов, волонтёрская деятельность — 1 балл.',
  },
];

const contacts = [
  { icon: <LocationOn />, title: 'Адрес', value: 'г. Москва, ул. Университетская, д. 1, каб. 215' },
  { icon: <Phone />, title: 'Телефон', value: '+7 (495) 123-45-67' },
  { icon: <Email />, title: 'Email', value: 'admissions@faculty-agu.ru' },
  { icon: <Schedule />, title: 'Часы работы', value: 'Пн–Пт: 9:00–17:00, Сб: 10:00–14:00' },
];

function ApplicantPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <Chip
            label="Приёмная кампания 2026"
            color="warning"
            sx={{ mb: 2, fontWeight: 'bold' }}
          />
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Поступай в Институт точных наук
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.95 }}>
            Цифровых технологий АГУ
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 700, opacity: 0.9 }}>
            Современное IT-образование с углублённым изучением математики, физики и
            информационных технологий. Диплом государственного образца, общежитие,
            стажировки в ведущих IT-компаниях.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<HowToReg />}
              href="mailto:admissions@faculty-agu.ru"
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
        {[
          { value: '95%', label: 'Трудоустройство выпускников' },
          { value: '4.6', label: 'Средний балл ЕГЭ' },
          { value: '60+', label: 'Бюджетных мест' },
          { value: '15', label: 'IT-партнёров' },
        ].map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
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
          {programs.map((program) => (
            <Grid item xs={12} md={6} lg={4} key={program.code + program.level}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{program.icon}</Avatar>
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
                    {program.exams.map((exam) => (
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
            Сроки приёма 2026
          </Typography>
        </Box>
        <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
          {timeline.map((item, idx) => (
            <Step key={item.label} completed={idx < activeStep}>
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

      {/* Документы */}
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
              {documents.map((doc, idx) => (
                <ListItem key={doc.name} divider={idx < documents.length - 1}>
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
              Для всех иногородних студентов очной формы обучения предоставляется место в
              комфортабельном общежитии. На территории — всё необходимое для учёбы и
              отдыха.
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {dormFeatures.map((feat) => (
                <Grid item xs={6} key={feat.text}>
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
                      {feat.icon}
                    </Avatar>
                    <Typography variant="body2">{feat.text}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Стоимость:</strong> от 800 ₽/мес
              <br />
              <strong>Адрес:</strong> ул. Студенческая, д. 5 (5 мин от института)
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
          {[
            {
              icon: <Business />,
              title: 'IT-партнёры',
              text: 'Стажировки и трудоустройство в Яндекс, VK, Сбер, Тинькофф',
            },
            {
              icon: <Groups />,
              title: 'Малые группы',
              text: 'До 15 человек на семинаре — индивидуальный подход',
            },
            {
              icon: <LocalLibrary />,
              title: 'Современная база',
              text: '4 компьютерных класса, лаборатория робототехники, научный центр',
            },
            {
              icon: <Science />,
              title: 'Научная работа',
              text: 'Публикации, гранты РФФИ, участие в конференциях со 2 курса',
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  {item.icon}
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
        {faq.map((item, idx) => (
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
          {contacts.map((c) => (
            <Grid item xs={12} sm={6} md={3} key={c.title}>
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
            href="mailto:admissions@faculty-agu.ru"
            sx={{ mr: 2 }}
          >
            Подать заявку
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Phone />}
            href="tel:+74951234567"
          >
            Позвонить
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ApplicantPage;

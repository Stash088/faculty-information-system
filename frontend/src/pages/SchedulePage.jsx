/**
 * Страница расписания
 * @module pages/SchedulePage
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { format, startOfWeek, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axios';

const DAYS_OF_WEEK = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const LESSON_TIMES = [
  { number: 1, start: '08:30', end: '10:00' },
  { number: 2, start: '10:15', end: '11:45' },
  { number: 3, start: '12:00', end: '13:30' },
  { number: 4, start: '13:45', end: '15:15' },
  { number: 5, start: '15:30', end: '17:00' },
  { number: 6, start: '17:15', end: '18:45' },
];

function SchedulePage() {
  const { user } = useSelector((state) => state.auth);
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedGroupId, setSelectedGroupId] = useState(''); // Фильтр по группе
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    courseId: '',
    groupId: '',
    teacherId: '',
    dayOfWeek: 1,
    lessonNumber: 1,
    room: '',
    building: '',
    lessonType: 'lecture',
    startTime: '08:30',
    endTime: '10:00',
  });
  const [error, setError] = useState('');

  const isAdmin = user?.roleId === 1 || user?.role?.code === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleRes, coursesRes, groupsRes, teachersRes] = await Promise.all([
        api.get('/schedule'),
        api.get('/courses'),
        api.get('/groups'),
        api.get('/teachers'),
      ]);
      setSchedule(scheduleRes.data.data || []);
      setCourses(coursesRes.data.data || []);
      setGroups(groupsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        courseId: item.courseId || '',
        groupId: item.groupId || '',
        teacherId: item.teacherId || '',
        dayOfWeek: item.dayOfWeek || 1,
        lessonNumber: item.lessonNumber || 1,
        room: item.room || '',
        building: item.building || '',
        lessonType: item.lessonType || 'lecture',
        startTime: item.startTime?.substring(0, 5) || '08:30',
        endTime: item.endTime?.substring(0, 5) || '10:00',
      });
    } else {
      setEditingItem(null);
      setFormData({
        courseId: '',
        groupId: '',
        teacherId: '',
        dayOfWeek: 1,
        lessonNumber: 1,
        room: '',
        building: '',
        lessonType: 'lecture',
        startTime: '08:30',
        endTime: '10:00',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setError('');
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Автозаполнение времени при изменении номера пары
    if (field === 'lessonNumber') {
      const lesson = LESSON_TIMES.find(l => l.number === parseInt(value));
      if (lesson) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          startTime: lesson.start,
          endTime: lesson.end,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.courseId || !formData.groupId || !formData.teacherId) {
        setError('Выберите курс, группу и преподавателя');
        return;
      }

      const payload = {
        ...formData,
        courseId: parseInt(formData.courseId),
        groupId: parseInt(formData.groupId),
        teacherId: parseInt(formData.teacherId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        lessonNumber: parseInt(formData.lessonNumber),
      };

      if (editingItem) {
        await api.put(`/schedule/${editingItem.id}`, payload);
      } else {
        await api.post('/schedule', payload);
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту запись расписания?')) return;
    try {
      await api.delete(`/schedule/${id}`);
      fetchData();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(currentWeek, i));

  // Фильтрация расписания по выбранной группе
  const filteredSchedule = selectedGroupId
    ? schedule.filter((lesson) => lesson.groupId === parseInt(selectedGroupId))
    : schedule;

  const getLessonsForDay = (dayIndex) => {
    return filteredSchedule.filter((lesson) => lesson.dayOfWeek === dayIndex + 1);
  };

  const getLessonTypeColor = (type) => {
    const colors = {
      lecture: '#1976d2',
      practice: '#2e7d32',
      lab: '#ed6c02',
      consultation: '#7b1fa2',
      exam: '#d32f2f',
    };
    return colors[type] || '#757575';
  };

  const getLessonTypeLabel = (type) => {
    const labels = {
      lecture: 'Лекция',
      practice: 'Практика',
      lab: 'Лабораторная',
      consultation: 'Консультация',
      exam: 'Экзамен',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Расписание занятий
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {format(currentWeek, 'd MMMM', { locale: ru })} —{' '}
            {format(addDays(currentWeek, 5), 'd MMMM yyyy', { locale: ru })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Фильтр по группе */}
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Группа</InputLabel>
            <Select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              label="Группа"
            >
              <MenuItem value="">Все группы</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {isAdmin && (
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Добавить занятие
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {weekDays.map((day, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" component="span">
                      {format(day, 'EEEE', { locale: ru })}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                      component="span"
                    >
                      {format(day, 'd MMMM', { locale: ru })}
                    </Typography>
                  </Box>
                </Box>
                
                {getLessonsForDay(index).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Занятий нет
                  </Typography>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {getLessonsForDay(index).map((lesson, lessonIndex) => (
                      <Box
                        key={lessonIndex}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderLeft: `4px solid ${getLessonTypeColor(lesson.lessonType)}`,
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          position: 'relative',
                        }}
                      >
                        {isAdmin && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleOpenDialog(lesson)}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(lesson.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pr: 10 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {lesson.course?.name || '—'}
                          </Typography>
                          <Chip
                            label={getLessonTypeLabel(lesson.lessonType)}
                            size="small"
                            sx={{
                              bgcolor: getLessonTypeColor(lesson.lessonType),
                              color: 'white',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {lesson.startTime?.substring(0, 5)} — {lesson.endTime?.substring(0, 5)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lesson.room && `Аудитория: ${lesson.room}`}
                          {lesson.building && `, ${lesson.building}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {lesson.teacher?.lastName} {lesson.teacher?.firstName}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog для добавления/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Редактировать занятие' : 'Добавить занятие'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>День недели</InputLabel>
              <Select
                value={formData.dayOfWeek}
                onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                label="День недели"
              >
                {DAYS_OF_WEEK.map((day, i) => (
                  <MenuItem key={i} value={i + 1}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Номер пары</InputLabel>
              <Select
                value={formData.lessonNumber}
                onChange={(e) => handleChange('lessonNumber', e.target.value)}
                label="Номер пары"
              >
                {LESSON_TIMES.map((lt) => (
                  <MenuItem key={lt.number} value={lt.number}>
                    {lt.number} пара ({lt.start} — {lt.end})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Курс</InputLabel>
              <Select
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                label="Курс"
              >
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Группа</InputLabel>
              <Select
                value={formData.groupId}
                onChange={(e) => handleChange('groupId', e.target.value)}
                label="Группа"
              >
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Преподаватель</InputLabel>
              <Select
                value={formData.teacherId}
                onChange={(e) => handleChange('teacherId', e.target.value)}
                label="Преподаватель"
              >
                {teachers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.lastName} {t.firstName} {t.patronymic || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Тип занятия</InputLabel>
              <Select
                value={formData.lessonType}
                onChange={(e) => handleChange('lessonType', e.target.value)}
                label="Тип занятия"
              >
                <MenuItem value="lecture">Лекция</MenuItem>
                <MenuItem value="practice">Практика</MenuItem>
                <MenuItem value="lab">Лабораторная</MenuItem>
                <MenuItem value="consultation">Консультация</MenuItem>
                <MenuItem value="exam">Экзамен</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Аудитория"
              value={formData.room}
              onChange={(e) => handleChange('room', e.target.value)}
            />

            <TextField
              fullWidth
              label="Корпус"
              value={formData.building}
              onChange={(e) => handleChange('building', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SchedulePage;

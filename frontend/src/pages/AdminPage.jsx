/**
 * Страница администрирования
 * @module pages/AdminPage
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../api/axios';

function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.code === 'admin' || user?.roleId === 1;

  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setError('');
      if (activeTab === 'news') {
        const res = await api.get('/news');
        setNews(res.data.data || []);
      } else if (activeTab === 'materials') {
        const res = await api.get('/materials');
        setMaterials(res.data.data || []);
      } else if (activeTab === 'courses') {
        const res = await api.get('/courses');
        setCourses(res.data.data || []);
        // Загружаем кафедры для формы курса
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.data.data || []);
      } else if (activeTab === 'users') {
        const res = await api.get('/users');
        setUsers(res.data.users || []);
        const rolesRes = await api.get('/users/roles');
        setRoles(rolesRes.data.roles || []);
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    }
  };

  const handleOpenDialog = (item = null) => {
    setFormData(item || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (activeTab === 'news') {
        if (formData.id) {
          await api.put(`/news/${formData.id}`, formData);
        } else {
          await api.post('/news', formData);
        }
      } else if (activeTab === 'courses') {
        if (formData.id) {
          await api.put(`/courses/${formData.id}`, formData);
        } else {
          await api.post('/courses', formData);
        }
      } else if (activeTab === 'materials') {
        if (formData.id) {
          await api.put(`/materials/${formData.id}`, formData);
        } else {
          await api.post('/materials', formData);
        }
      } else if (activeTab === 'users') {
        if (formData.id) {
          await api.put(`/users/${formData.id}`, formData);
        } else {
          await api.post('/users', formData);
        }
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError('Ошибка сохранения данных');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить запись?')) return;
    try {
      if (activeTab === 'news') {
        await api.delete(`/news/${id}`);
      } else if (activeTab === 'materials') {
        await api.delete(`/materials/${id}`);
      } else if (activeTab === 'courses') {
        await api.delete(`/courses/${id}`);
      }
      fetchData();
    } catch (err) {
      setError('Ошибка удаления');
      console.error(err);
    }
  };

  const tabs = [
    { key: 'news', label: 'Новости' },
    { key: 'materials', label: 'Материалы' },
    { key: 'courses', label: 'Курсы' },
    { key: 'users', label: 'Пользователи' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Управление контентом
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'contained' : 'text'}
            onClick={() => setActiveTab(tab.key)}
            sx={{ mr: 1, borderRadius: '4px 4px 0 0' }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Content */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить
        </Button>
      </Box>

      {/* News Table */}
      {activeTab === 'news' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Заголовок</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Опубликовано</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.isPublished ? 'Да' : 'Нет'}
                      color={item.isPublished ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Materials Table */}
      {activeTab === 'materials' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <Chip label={item.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Courses Table */}
      {activeTab === 'courses' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Код</TableCell>
                <TableCell>Семестр</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.semester}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip label={item.role?.name || 'Неизвестно'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.isActive ? 'Активен' : 'Отключён'}
                      color={item.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formData.id ? 'Редактировать' : 'Добавить'}{' '}
          {activeTab === 'news' ? 'новость' : activeTab === 'courses' ? 'курс' : activeTab === 'materials' ? 'материал' : 'пользователя'}
        </DialogTitle>
        <DialogContent>
          {activeTab === 'news' && (
            <>
              <TextField
                fullWidth
                label="Заголовок"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Содержимое"
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                margin="normal"
                multiline
                rows={4}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Категория</InputLabel>
                <Select
                  value={formData.category || 'news'}
                  onChange={(e) => handleChange('category', e.target.value)}
                  label="Категория"
                >
                  <MenuItem value="news">Новость</MenuItem>
                  <MenuItem value="announcement">Объявление</MenuItem>
                  <MenuItem value="event">Событие</MenuItem>
                  <MenuItem value="notice">Уведомление</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished || false}
                    onChange={(e) => handleChange('isPublished', e.target.checked)}
                  />
                }
                label="Опубликовано"
                sx={{ mt: 2 }}
              />
            </>
          )}
          {activeTab === 'courses' && (
            <>
              <TextField
                fullWidth
                label="Название"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Код курса"
                value={formData.code || ''}
                onChange={(e) => handleChange('code', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Описание"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Семестр"
                type="number"
                value={formData.semester || ''}
                onChange={(e) => handleChange('semester', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 1, max: 12 }}
              />
              <TextField
                fullWidth
                label="Год"
                type="number"
                value={formData.year || new Date().getFullYear()}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Кредиты"
                type="number"
                value={formData.credits || ''}
                onChange={(e) => handleChange('credits', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 0 }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Кафедра</InputLabel>
                <Select
                  value={formData.departmentId || ''}
                  onChange={(e) => handleChange('departmentId', e.target.value)}
                  label="Кафедра"
                >
                  <MenuItem value=""><em>Не выбрано</em></MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
          {activeTab === 'materials' && (
            <>
              <TextField
                fullWidth
                label="Название"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Описание"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="ID курса"
                type="number"
                value={formData.courseId || ''}
                onChange={(e) => handleChange('courseId', parseInt(e.target.value))}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип материала</InputLabel>
                <Select
                  value={formData.type || 'methodical'}
                  onChange={(e) => handleChange('type', e.target.value)}
                  label="Тип материала"
                >
                  <MenuItem value="lecture">Лекция</MenuItem>
                  <MenuItem value="practice">Практика</MenuItem>
                  <MenuItem value="lab">Лабораторная</MenuItem>
                  <MenuItem value="methodical">Методический</MenuItem>
                  <MenuItem value="additional">Дополнительный</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished || false}
                    onChange={(e) => handleChange('isPublished', e.target.checked)}
                  />
                }
                label="Опубликовано"
                sx={{ mt: 2 }}
              />
            </>
          )}
          {activeTab === 'users' && (
            <>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Пароль"
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                margin="normal"
                required={!formData.id}
              />
              <TextField
                fullWidth
                label="Имя"
                value={formData.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Отчество"
                value={formData.patronymic || ''}
                onChange={(e) => handleChange('patronymic', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Роль</InputLabel>
                <Select
                  value={formData.roleId || ''}
                  onChange={(e) => handleChange('roleId', e.target.value)}
                  label="Роль"
                >
                  <MenuItem value={1}>Администратор</MenuItem>
                  <MenuItem value={2}>Преподаватель</MenuItem>
                  <MenuItem value={3}>Методист</MenuItem>
                  <MenuItem value={4}>Студент</MenuItem>
                  <MenuItem value={5}>Абитуриент</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
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

export default AdminPage;

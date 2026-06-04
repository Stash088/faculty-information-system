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
  Visibility,
  Download,
  Block,
} from '@mui/icons-material';
import api from '../api/axios';
import ApplicantContentEditor from '../components/ApplicantContentEditor';

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
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
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
      } else if (activeTab === 'departments') {
        const res = await api.get('/departments');
        setDepartments(res.data.data || []);
      } else if (activeTab === 'groups') {
        const res = await api.get('/groups');
        setGroups(res.data.data || []);
        // Нужны кафедры для формы
        if (departments.length === 0) {
          const deptRes = await api.get('/departments');
          setDepartments(deptRes.data.data || []);
        }
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    }
  };

  const handleOpenDialog = (item = null) => {
    setFormData(item || {});
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({});
    setSelectedFile(null);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Файл слишком большой (макс. 10 МБ)');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
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
        if (!formData.title || !formData.courseId) {
          setError('Название и курс обязательны');
          return;
        }
        if (!formData.id && !selectedFile) {
          setError('Выберите файл для загрузки');
          return;
        }
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description || '');
        data.append('courseId', formData.courseId);
        data.append('type', formData.type || 'methodical');
        data.append('isPublished', formData.isPublished || false);
        if (selectedFile) {
          data.append('file', selectedFile);
        }
        if (formData.id) {
          await api.put(`/materials/${formData.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.post('/materials', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else if (activeTab === 'users') {
        if (formData.id) {
          await api.put(`/users/${formData.id}`, formData);
        } else {
          await api.post('/users', formData);
        }
      } else if (activeTab === 'departments') {
        if (!formData.name) {
          setError('Название обязательно');
          return;
        }
        if (formData.id) {
          await api.put(`/departments/${formData.id}`, formData);
        } else {
          await api.post('/departments', formData);
        }
      } else if (activeTab === 'groups') {
        if (!formData.name || !formData.departmentId) {
          setError('Название и кафедра обязательны');
          return;
        }
        if (formData.id) {
          await api.put(`/groups/${formData.id}`, formData);
        } else {
          await api.post('/groups', formData);
        }
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения данных');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить запись?')) return;
    try {
      const endpoints = {
        news: `/news/${id}`,
        materials: `/materials/${id}`,
        courses: `/courses/${id}`,
        users: `/users/${id}`,
        departments: `/departments/${id}`,
        groups: `/groups/${id}`,
      };
      const url = endpoints[activeTab];
      if (url) {
        await api.delete(url);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления');
      console.error(err);
    }
  };

  const handleToggleBlock = async (user) => {
    if (!window.confirm(`${user.isBlocked ? 'Разблокировать' : 'Заблокировать'} пользователя ${user.email}?`)) return;
    try {
      await api.patch(`/users/${user.id}/toggle-block`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка блокировки');
    }
  };

  const tabs = [
    { key: 'news', label: 'Новости' },
    { key: 'materials', label: 'Материалы' },
    { key: 'courses', label: 'Курсы' },
    { key: 'departments', label: 'Кафедры' },
    { key: 'groups', label: 'Группы' },
    { key: 'users', label: 'Пользователи' },
    { key: 'applicant', label: 'Лендинг' },
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
      {activeTab !== 'applicant' && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить
          </Button>
        </Box>
      )}

      {activeTab === 'applicant' && <ApplicantContentEditor />}

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
                <TableCell>Курс</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Файл</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.course?.name || '—'}</TableCell>
                  <TableCell>
                    <Chip label={item.type} size="small" />
                  </TableCell>
                  <TableCell>
                    {item.filePath ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => window.open(`/api/materials/${item.id}/view`, '_blank')} title="Просмотр">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" onClick={() => window.location.href = `/api/materials/${item.id}/download`} title="Скачать">
                          <Download />
                        </IconButton>
                      </Box>
                    ) : (
                      <Chip label="Нет файла" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)} title="Редактировать">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error" title="Удалить">
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

      {/* Departments Table */}
      {activeTab === 'departments' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Сокращение</TableCell>
                <TableCell>Код</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.shortName || '—'}</TableCell>
                  <TableCell>{item.code || '—'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)} title="Редактировать">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error" title="Удалить">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Groups Table */}
      {activeTab === 'groups' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Кафедра</TableCell>
                <TableCell>Курс</TableCell>
                <TableCell>Семестр</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.department?.shortName || item.department?.name || '—'}</TableCell>
                  <TableCell>{item.year || '—'}</TableCell>
                  <TableCell>{item.semester || '—'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)} title="Редактировать">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error" title="Удалить">
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
                <TableCell>Действия</TableCell>
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
                    {item.isBlocked ? (
                      <Chip label="Заблокирован" color="error" size="small" />
                    ) : (
                      <Chip label="Активен" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(item)} title="Редактировать">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleBlock(item)}
                      title={item.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                      color={item.isBlocked ? 'success' : 'warning'}
                    >
                      <Block />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item.id)} color="error" title="Удалить">
                      <DeleteIcon />
                    </IconButton>
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
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Курс</InputLabel>
                <Select
                  value={formData.courseId || ''}
                  onChange={(e) => handleChange('courseId', e.target.value)}
                  label="Курс"
                >
                  {courses.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <Box sx={{ mt: 2, mb: 1 }}>
                <input
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.webm,.mp3,.wav,.zip,.rar,.jpg,.jpeg,.png,.gif"
                  style={{ display: 'none' }}
                  id="admin-material-file-input"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="admin-material-file-input">
                  <Button variant="outlined" component="span" fullWidth>
                    {selectedFile ? `Выбран: ${selectedFile.name}` : (formData.id ? 'Заменить файл (необязательно)' : 'Выбрать файл')}
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Размер: {(selectedFile.size / 1024).toFixed(1)} КБ
                  </Typography>
                )}
                {formData.id && !selectedFile && formData.fileName && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Текущий файл: {formData.fileName}
                  </Typography>
                )}
              </Box>
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
          {activeTab === 'departments' && (
            <>
              <TextField
                fullWidth
                label="Полное название"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Сокращение"
                value={formData.shortName || ''}
                onChange={(e) => handleChange('shortName', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Код (уникальный)"
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
                rows={2}
              />
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                margin="normal"
              />
            </>
          )}
          {activeTab === 'groups' && (
            <>
              <TextField
                fullWidth
                label="Название (например, ИВТ-101)"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Направление (например, ИВТ)"
                value={formData.course || ''}
                onChange={(e) => handleChange('course', e.target.value)}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Кафедра</InputLabel>
                <Select
                  value={formData.departmentId || ''}
                  onChange={(e) => handleChange('departmentId', e.target.value)}
                  label="Кафедра"
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.shortName || d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Курс (1-6)"
                type="number"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', parseInt(e.target.value))}
                margin="normal"
                required
                inputProps={{ min: 1, max: 6 }}
              />
              <TextField
                fullWidth
                label="Семестр (1-12)"
                type="number"
                value={formData.semester || ''}
                onChange={(e) => handleChange('semester', parseInt(e.target.value))}
                margin="normal"
                required
                inputProps={{ min: 1, max: 12 }}
              />
              <TextField
                fullWidth
                label="Кол-во студентов"
                type="number"
                value={formData.studentCount || 0}
                onChange={(e) => handleChange('studentCount', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 0 }}
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

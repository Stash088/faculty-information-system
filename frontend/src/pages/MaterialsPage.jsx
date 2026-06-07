/**
 * Страница учебных материалов
 * @module pages/MaterialsPage
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Button,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from '@mui/material';
import {
  Download,
  Visibility,
  Search,
  Description,
  PictureAsPdf,
  Add,
  Delete,
  CloudUpload,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axios';
import { getCategories } from '../api/categories';

function MaterialsPage() {
  const { user } = useSelector((state) => state.auth);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'methodical',
    categoryId: '',
    isPublished: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const isAdmin = user?.roleId === 1 || user?.role?.code === 'admin';
  const isTeacher = user?.role?.code === 'admin' || user?.role?.code === 'teacher' || user?.role?.code === 'methodist';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, coursesRes, categoriesRes] = await Promise.all([
        api.get('/materials'),
        api.get('/courses'),
        getCategories(),
      ]);
      setMaterials(materialsRes.data.data || []);
      setCourses(coursesRes.data.data || []);
      setCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title,
        description: material.description || '',
        courseId: material.courseId,
        type: material.type,
        categoryId: material.categoryId || '',
        isPublished: material.isPublished,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        type: 'methodical',
        categoryId: '',
        isPublished: false,
      });
    }
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaterial(null);
    setSelectedFile(null);
    setError('');
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
      if (!formData.title || !formData.courseId) {
        setError('Название и курс обязательны');
        return;
      }
      if (!editingMaterial && !selectedFile) {
        setError('Выберите файл для загрузки');
        return;
      }

      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description || '');
      data.append('courseId', formData.courseId);
      data.append('type', formData.type);
      data.append('isPublished', formData.isPublished);
      if (formData.categoryId) data.append('categoryId', formData.categoryId);
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/materials', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || `Ошибка ${editingMaterial ? 'обновления' : 'создания'} материала`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот материал?')) return;
    try {
      await api.delete(`/materials/${id}`);
      fetchData();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleView = (material) => {
    if (!material.filePath) {
      setError('Файл не загружен');
      return;
    }
    window.open(`/api/materials/${material.id}/view`, '_blank');
  };

  const handleDownload = (material) => {
    if (!material.filePath) {
      setError('Файл не загружен');
      return;
    }
    window.location.href = `/api/materials/${material.id}/download`;
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) {
      return <PictureAsPdf sx={{ fontSize: 40, color: '#d32f2f' }} />;
    }
    return <Description sx={{ fontSize: 40, color: '#1976d2' }} />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      lecture: 'Лекция',
      practice: 'Практика',
      lab: 'Лабораторная',
      methodical: 'Методический',
      additional: 'Дополнительный',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      lecture: 'primary',
      practice: 'success',
      lab: 'warning',
      methodical: 'info',
      additional: 'default',
    };
    return colors[type] || 'default';
  };

  const canEdit = (material) => {
    return isAdmin || material.teacherId === user?.id;
  };

  const filteredMaterials = materials.filter((material) => {
    // Поиск по тексту
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = material.title?.toLowerCase().includes(q);
      const inCourse = material.course?.name?.toLowerCase().includes(q);
      const inCategory = material.category?.name?.toLowerCase().includes(q);
      if (!inTitle && !inCourse && !inCategory) return false;
    }
    // Фильтр по категории
    if (filterCategory && material.categoryId !== parseInt(filterCategory, 10)) {
      return false;
    }
    // Фильтр по типу
    if (filterType && material.type !== filterType) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Учебные материалы
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Методические и учебные материалы для изучения
          </Typography>
        </Box>
        {isTeacher && (
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Загрузить материал
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Фильтры */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Поиск материалов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Категория</InputLabel>
              <Select
                value={filterCategory}
                label="Категория"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">Все категории</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Тип</InputLabel>
              <Select
                value={filterType}
                label="Тип"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">Все типы</MenuItem>
                <MenuItem value="lecture">Лекция</MenuItem>
                <MenuItem value="practice">Практика</MenuItem>
                <MenuItem value="lab">Лабораторная</MenuItem>
                <MenuItem value="methodical">Методический</MenuItem>
                <MenuItem value="additional">Дополнительный</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {(filterCategory || filterType || searchQuery) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Найдено: {filteredMaterials.length} из {materials.length}
            </Typography>
            <Button size="small" onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterType(''); }}>
              Сбросить фильтры
            </Button>
          </Stack>
        )}
      </Card>

      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Материалы не найдены
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredMaterials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    {getFileIcon(material.mimeType)}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {material.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {material.course?.name}
                      </Typography>
                    </Box>
                    {canEdit(material) && (
                      <Button size="small" onClick={() => handleOpenDialog(material)}>
                        <Edit fontSize="small" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button size="small" color="error" onClick={() => handleDelete(material.id)}>
                        <Delete fontSize="small" />
                      </Button>
                    )}
                  </Box>

                  {material.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {material.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {material.category && (
                      <Chip
                        label={material.category.name}
                        size="small"
                        sx={{
                          bgcolor: material.category.color || '#1976d2',
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    )}
                    <Chip
                      label={getTypeLabel(material.type)}
                      color={getTypeColor(material.type)}
                      size="small"
                    />
                    {material.fileSize > 0 && (
                      <Chip
                        label={`${(material.fileSize / 1024).toFixed(1)} КБ`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {material.teacher?.lastName} {material.teacher?.firstName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {format(new Date(material.publishedAt || material.created_at), 'd MMMM yyyy', { locale: ru })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleView(material)}
                    disabled={!material.filePath}
                  >
                    Просмотр
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownload(material)}
                    disabled={!material.filePath}
                  >
                    Скачать
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог создания/редактирования материала */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMaterial ? 'Редактировать материал' : 'Загрузить материал'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Название"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
            />

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

            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                label="Категория"
              >
                <MenuItem value="">Без категории</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c.color }} />
                      {c.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Тип материала</InputLabel>
              <Select
                value={formData.type}
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

            <Box>
              <input
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.webm,.mp3,.wav,.zip,.rar,.jpg,.jpeg,.png,.gif"
                style={{ display: 'none' }}
                id="material-file-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="material-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  {selectedFile ? `Выбран: ${selectedFile.name}` : (editingMaterial ? 'Заменить файл (необязательно)' : 'Выбрать файл')}
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Размер: {(selectedFile.size / 1024).toFixed(1)} КБ
                </Typography>
              )}
              {editingMaterial && !selectedFile && editingMaterial.fileName && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Текущий файл: {editingMaterial.fileName}
                </Typography>
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={(e) => handleChange('isPublished', e.target.checked)}
                />
              }
              label={formData.isPublished ? 'Опубликован (виден студентам)' : 'Черновик (виден только преподавателям)'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Сохранение...' : (editingMaterial ? 'Сохранить' : 'Создать')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MaterialsPage;

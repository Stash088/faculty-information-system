/**
 * Страница учебных материалов
 * @module pages/MaterialsPage
 */

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import {
  Download,
  Visibility,
  Search,
  Description,
  PictureAsPdf,
  Add,
  Delete,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axios';

function MaterialsPage() {
  const { user } = useSelector((state) => state.auth);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'methodical',
    isPublished: false,
  });
  const [error, setError] = useState('');

  const isAdmin = user?.roleId === 1 || user?.role?.code === 'admin';
  const isTeacher = user?.role?.code === 'admin' || user?.role?.code === 'teacher' || user?.role?.code === 'methodist';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materialsRes, coursesRes] = await Promise.all([
        api.get('/materials'),
        api.get('/courses'),
      ]);
      setMaterials(materialsRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      type: 'methodical',
      isPublished: false,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.title || !formData.courseId) {
        setError('Название и курс обязательны');
        return;
      }

      await api.post('/materials', formData);
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания материала');
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

  const filteredMaterials = materials.filter(
    (material) =>
      material.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.course?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenDialog}>
            Загрузить материал
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Поиск материалов..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

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
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {material.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {material.course?.name}
                      </Typography>
                    </Box>
                    {isAdmin && (
                      <Button size="small" color="error" onClick={() => handleDelete(material.id)}>
                        <Delete />
                      </Button>
                    )}
                  </Box>
                  
                  {material.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {material.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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

                  <Typography variant="caption" color="text.secondary">
                    {material.teacher?.lastName} {material.teacher?.firstName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {format(new Date(material.publishedAt || material.created_at), 'd MMMM yyyy', { locale: ru })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Visibility />}>
                    Просмотр
                  </Button>
                  <Button size="small" startIcon={<Download />}>
                    Скачать
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog для создания материала */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Загрузить материал</DialogTitle>
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

            <Button
              variant={formData.isPublished ? 'contained' : 'outlined'}
              color={formData.isPublished ? 'success' : 'primary'}
              onClick={() => handleChange('isPublished', !formData.isPublished)}
            >
              {formData.isPublished ? 'Опубликован' : 'Опубликовать'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MaterialsPage;

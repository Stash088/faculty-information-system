/**
 * Страница "Мои материалы" — для преподавателей
 * @module pages/MyMaterialsPage
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Download,
  Visibility,
  Search,
  Description,
  PictureAsPdf,
  Add,
  CloudUpload,
  Edit,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axios';

function MyMaterialsPage() {
  const { user } = useSelector((state) => state.auth);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'methodical',
    isPublished: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      // Фильтруем только материалы текущего пользователя
      const myMaterials = (materialsRes.data.data || []).filter(
        (m) => m.teacherId === user?.id
      );
      setMaterials(myMaterials);
      setCourses(coursesRes.data.data || []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
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
        isPublished: material.isPublished,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: '',
        description: '',
        courseId: '',
        type: 'methodical',
        isPublished: false,
      });
    }
    setSelectedFile(null);
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
        setError('Выберите файл');
        return;
      }

      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description || '');
      data.append('courseId', formData.courseId);
      data.append('type', formData.type);
      data.append('isPublished', formData.isPublished);
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
      setError(err.response?.data?.message || 'Ошибка сохранения');
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
    window.open(`/api/materials/${material.id}/view`, '_blank');
  };

  const handleDownload = (material) => {
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
      lecture: 'Лекция', practice: 'Практика', lab: 'Лабораторная',
      methodical: 'Методический', additional: 'Дополнительный',
    };
    return labels[type] || type;
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
            Мои материалы
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Управление вашими учебными материалами ({materials.length})
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Загрузить материал
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Поиск..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><Search /></InputAdornment>
          ),
        }}
      />

      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              У вас пока нет загруженных материалов
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ mt: 2 }}
            >
              Загрузить первый материал
            </Button>
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
                    <Button size="small" onClick={() => handleOpenDialog(material)}>
                      <Edit fontSize="small" />
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete(material.id)}>
                      ×
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={getTypeLabel(material.type)} size="small" color="primary" />
                    {material.isPublished ? (
                      <Chip label="Опубликован" size="small" color="success" />
                    ) : (
                      <Chip label="Черновик" size="small" color="default" />
                    )}
                    {material.fileSize > 0 && (
                      <Chip label={`${(material.fileSize / 1024).toFixed(1)} КБ`} size="small" variant="outlined" />
                    )}
                    {material.views > 0 && (
                      <Chip label={`${material.views} просм.`} size="small" variant="outlined" />
                    )}
                    {material.downloads > 0 && (
                      <Chip label={`${material.downloads} скач.`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {format(new Date(material.publishedAt || material.created_at), 'd MMMM yyyy', { locale: ru })}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<Visibility />} onClick={() => handleView(material)}>
                    Просмотр
                  </Button>
                  <Button size="small" startIcon={<Download />} onClick={() => handleDownload(material)}>
                    Скачать
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMaterial ? 'Редактировать материал' : 'Загрузить материал'}</DialogTitle>
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
              <InputLabel>Тип</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Тип"
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
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.webm,.mp3,.wav,.zip,.rar,.jpg,.jpeg,.png,.gif"
                style={{ display: 'none' }}
                id="my-mat-file-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="my-mat-file-input">
                <Button variant="outlined" component="span" fullWidth startIcon={<CloudUpload />}>
                  {selectedFile ? `Выбран: ${selectedFile.name}` : (editingMaterial ? 'Заменить файл' : 'Выбрать файл')}
                </Button>
              </label>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={(e) => handleChange('isPublished', e.target.checked)}
                />
              }
              label={formData.isPublished ? 'Опубликован' : 'Черновик'}
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

export default MyMaterialsPage;
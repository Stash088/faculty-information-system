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

function MaterialsPage() {
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
  const fileInputRef = useRef(null);

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
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Загрузить материал
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

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
                    {material.views > 0 && (
                      <Chip
                        label={`${material.views} просм.`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {material.downloads > 0 && (
                      <Chip
                        label={`${material.downloads} скач.`}
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
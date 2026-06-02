/**
 * Страница новостей
 * @module pages/NewsPage
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axios';

function NewsPage() {
  const { user } = useSelector((state) => state.auth);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'news',
    isPublished: false,
    isPinned: false,
    image: '',
  });
  const [error, setError] = useState('');

  const isAdmin = user?.roleId === 1 || user?.role?.code === 'admin';

  useEffect(() => {
    fetchNews();
  }, [page]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/news', {
        params: { page, limit: 6, published: 'true' },
      });
      setNews(response.data.data || []);
      setTotalPages(Math.ceil((response.data.pagination?.total || 1) / 6));
    } catch (err) {
      console.error('Ошибка загрузки новостей:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        content: item.content || '',
        excerpt: item.excerpt || '',
        category: item.category || 'news',
        isPublished: item.isPublished || false,
        isPinned: item.isPinned || false,
        image: item.image || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: 'news',
        isPublished: false,
        isPinned: false,
        image: '',
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
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.title) {
        setError('Заголовок обязателен');
        return;
      }

      if (editingItem) {
        await api.put(`/news/${editingItem.id}`, formData);
      } else {
        await api.post('/news', formData);
      }
      handleCloseDialog();
      fetchNews();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту новость?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      news: 'Новость',
      announcement: 'Объявление',
      event: 'Событие',
      notice: 'Уведомление',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      news: 'primary',
      announcement: 'warning',
      event: 'success',
      notice: 'info',
    };
    return colors[category] || 'default';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Новости и объявления
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Актуальные новости и события института
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Создать новость
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {news.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Новости не найдены
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {news.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  {item.image && (
                    <CardMedia
                      component="img"
                      height="160"
                      image={item.image}
                      alt={item.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'space-between' }}>
                      <Chip
                        label={getCategoryLabel(item.category)}
                        color={getCategoryColor(item.category)}
                        size="small"
                      />
                      {isAdmin && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button size="small" onClick={() => handleOpenDialog(item)}>
                            <Edit fontSize="small" />
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDelete(item.id)}>
                            <Delete fontSize="small" />
                          </Button>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    
                    {item.excerpt && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.excerpt.length > 100
                          ? `${item.excerpt.substring(0, 100)}...`
                          : item.excerpt}
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      {item.author?.lastName} {item.author?.firstName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {format(new Date(item.publishedAt || item.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog для создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Редактировать новость' : 'Создать новость'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Заголовок"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Краткое описание"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Содержимое"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              multiline
              rows={6}
            />

            <TextField
              fullWidth
              label="URL изображения"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                label="Категория"
              >
                <MenuItem value="news">Новость</MenuItem>
                <MenuItem value="announcement">Объявление</MenuItem>
                <MenuItem value="event">Событие</MenuItem>
                <MenuItem value="notice">Уведомление</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={formData.isPublished ? 'contained' : 'outlined'}
                color={formData.isPublished ? 'success' : 'primary'}
                onClick={() => handleChange('isPublished', !formData.isPublished)}
              >
                {formData.isPublished ? 'Опубликовано' : 'Опубликовать'}
              </Button>

              <Button
                variant={formData.isPinned ? 'contained' : 'outlined'}
                color={formData.isPinned ? 'warning' : 'primary'}
                onClick={() => handleChange('isPinned', !formData.isPinned)}
              >
                {formData.isPinned ? 'Закреплено' : 'Закрепить'}
              </Button>
            </Box>
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

export default NewsPage;

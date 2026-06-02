/**
 * Главная страница
 * @module pages/HomePage
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import {
  School,
  MenuBook,
  Schedule,
  Newspaper,
  ArrowForward,
} from '@mui/icons-material';

function HomePage() {
  const { user } = useSelector((state) => state.auth);

  const quickLinks = [
    {
      title: 'Расписание',
      description: 'Просмотр расписания занятий',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      path: '/schedule',
      color: '#1976d2',
    },
    {
      title: 'Материалы',
      description: 'Учебные и методические материалы',
      icon: <MenuBook sx={{ fontSize: 40 }} />,
      path: '/materials',
      color: '#2e7d32',
    },
    {
      title: 'Новости',
      description: 'Новости и объявления института',
      icon: <Newspaper sx={{ fontSize: 40 }} />,
      path: '/news',
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      {/* Приветственный блок */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Добро пожаловать, {user?.firstName} {user?.lastName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Информационная система Института точных наук и цифровых технологий — ваш центр управления учебным процессом
        </Typography>
      </Box>

      {/* Роль пользователя */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ color: 'white', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <School sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {user?.role?.name || 'Пользователь'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Быстрые ссылки */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Быстрый доступ
      </Typography>
      <Grid container spacing={3}>
        {quickLinks.map((link) => (
          <Grid item xs={12} sm={6} md={4} key={link.title}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    color: link.color,
                  }}
                >
                  {link.icon}
                  <Typography variant="h6" fontWeight="bold">
                    {link.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {link.description}
                </Typography>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  component={RouterLink}
                  to={link.path}
                  sx={{ color: link.color, borderColor: link.color }}
                >
                  Перейти
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Информационный блок */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Полезная информация
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Используйте навигационное меню слева для доступа к различным разделам системы.
            Если у вас возникли вопросы, обратитесь в дирекцию института.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Учебные материалы" color="primary" size="small" />
            <Chip label="Расписание занятий" color="success" size="small" />
            <Chip label="Новости института" color="warning" size="small" />
            <Chip label="Личный кабинет" color="info" size="small" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default HomePage;

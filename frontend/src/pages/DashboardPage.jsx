/**
 * Страница панели управления
 * @module pages/DashboardPage
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
  Chip,
} from '@mui/material';
import {
  People,
  MenuBook,
  Schedule,
  Newspaper,
} from '@mui/icons-material';
import api from '../api/axios';

function DashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    materials: 0,
    news: 0,
    courses: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Пользователи',
      value: stats.users,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      visible: user?.role?.code === 'admin',
    },
    {
      title: 'Учебные материалы',
      value: stats.materials,
      icon: <MenuBook sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      visible: ['admin', 'teacher', 'methodist', 'student'].includes(user?.role?.code),
    },
    {
      title: 'Новости и объявления',
      value: stats.news,
      icon: <Newspaper sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      visible: true,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Панель управления
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Обзор активности системы
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {statCards
              .filter((card) => card.visible)
              .map((card) => (
                <Grid item xs={12} sm={6} md={4} key={card.title}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {card.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {card.title}
                          </Typography>
                        </Box>
                        <Box sx={{ color: card.color }}>{card.icon}</Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>

          {/* Информация о пользователе */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Информация о пользователе
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ФИО
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {user?.firstName} {user?.lastName}
                    {user?.patronymic && ` ${user.patronymic}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Роль
                  </Typography>
                  <Chip
                    label={user?.role?.name || 'Неизвестно'}
                    color="primary"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default DashboardPage;

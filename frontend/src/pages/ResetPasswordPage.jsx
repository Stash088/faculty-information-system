/**
 * Страница сброса пароля по токену
 * @module pages/ResetPasswordPage
 */

import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Alert,
  Paper,
} from '@mui/material';
import api from '../api/axios';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      navigate('/forgot-password');
    } else {
      setToken(t);
    }
  }, [searchParams, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const password = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Новый пароль
            </Typography>

            {success ? (
              <>
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  Пароль успешно изменён. Сейчас вы будете перенаправлены на страницу входа.
                </Alert>
                <Link component={RouterLink} to="/login" variant="body2">
                  Войти
                </Link>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Введите новый пароль (минимум 8 символов, буквы и цифры).
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Новый пароль"
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    {...register('newPassword', {
                      required: 'Пароль обязателен',
                      minLength: {
                        value: 8,
                        message: 'Минимум 8 символов',
                      },
                      pattern: {
                        value: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                        message: 'Пароль должен содержать буквы и цифры',
                      },
                    })}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Подтверждение пароля"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword', {
                      required: 'Подтвердите пароль',
                      validate: (value) =>
                        value === password || 'Пароли не совпадают',
                    })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading || !token}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                  >
                    {loading ? 'Сохранение...' : 'Сохранить новый пароль'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Link component={RouterLink} to="/login" variant="body2">
                      Вернуться на страницу входа
                    </Link>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPasswordPage;
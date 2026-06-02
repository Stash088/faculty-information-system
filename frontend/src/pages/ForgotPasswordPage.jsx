/**
 * Страница запроса восстановления пароля
 * @module pages/ForgotPasswordPage
 */

import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка запроса');
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
              Восстановление пароля
            </Typography>

            {submitted ? (
              <>
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  Если email зарегистрирован в системе, на него отправлена инструкция по восстановлению пароля.
                </Alert>
                <Link component={RouterLink} to="/login" variant="body2">
                  Вернуться на страницу входа
                </Link>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Введите email, указанный при регистрации. Мы отправим инструкцию по восстановлению пароля.
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
                    label="Email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    {...register('email', {
                      required: 'Email обязателен',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Некорректный email',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                  >
                    {loading ? 'Отправка...' : 'Отправить инструкцию'}
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

export default ForgotPasswordPage;
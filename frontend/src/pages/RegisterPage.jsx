/**
 * Страница регистрации
 * @module pages/RegisterPage
 */

import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { register, clearError } from '../redux/slices/authSlice';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register: registerForm,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(clearError());
    const { confirmPassword, ...registerData } = data;
    dispatch(register(registerData));
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Регистрация
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Создание учётной записи студента
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ width: '100%' }}
            >
              <TextField
                margin="normal"
                fullWidth
                label="Фамилия"
                autoFocus
                {...registerForm('lastName', {
                  required: 'Фамилия обязательна',
                })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Имя"
                {...registerForm('firstName', {
                  required: 'Имя обязательно',
                })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                {...registerForm('email', {
                  required: 'Email обязателен',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Некорректный email',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                {...registerForm('password', {
                  required: 'Пароль обязателен',
                  minLength: {
                    value: 8,
                    message: 'Пароль должен содержать минимум 8 символов',
                  },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                    message: 'Пароль должен содержать буквы и цифры',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Подтверждение пароля"
                type="password"
                {...registerForm('confirmPassword', {
                  required: 'Подтверждение пароля обязательно',
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
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                >
                  Уже есть учётная запись? Войти
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPage;

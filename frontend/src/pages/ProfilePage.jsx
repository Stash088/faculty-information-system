/**
 * Страница профиля пользователя
 * @module pages/ProfilePage
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { updateProfile, logout } from '../redux/slices/authSlice';

function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      patronymic: user?.patronymic || '',
      phone: user?.phone || '',
    },
  });

  // Синхронизация формы при изменении user из Redux
  useEffect(() => {
    if (user && !isEditing) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        patronymic: user.patronymic || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset, isEditing]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const password = watch('newPassword');

  const onSubmitProfile = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      enqueueSnackbar('Профиль успешно обновлён', { variant: 'success' });
      setIsEditing(false);
    } catch (error) {
      enqueueSnackbar(error || 'Ошибка обновления профиля', { variant: 'error' });
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      enqueueSnackbar('Пароль успешно изменён. Выполните вход заново.', { variant: 'success' });
      setIsChangingPassword(false);
      resetPassword();
      setTimeout(() => {
        dispatch(logout());
      }, 1500);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Ошибка смены пароля', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Профиль пользователя
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Управление личными данными и настройками аккаунта
      </Typography>

      <Grid container spacing={3}>
        {/* Информация о пользователе */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              {user?.patronymic && (
                <Typography variant="body1" color="text.secondary">
                  {user.patronymic}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user?.email}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Роль в системе
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {user?.role?.name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Редактирование профиля */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Личные данные
                </Typography>
                <Button
                  variant={isEditing ? 'outlined' : 'contained'}
                  onClick={() => {
                    setIsEditing(!isEditing);
                    if (!isEditing) {
                      reset({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        patronymic: user?.patronymic || '',
                        phone: user?.phone || '',
                      });
                    }
                  }}
                >
                  {isEditing ? 'Отмена' : 'Редактировать'}
                </Button>
              </Box>

              {isEditing ? (
                <Box component="form" onSubmit={handleSubmit(onSubmitProfile)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Фамилия"
                        {...register('lastName', { required: 'Фамилия обязательна' })}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Имя"
                        {...register('firstName', { required: 'Имя обязательно' })}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Отчество"
                        {...register('patronymic')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Телефон"
                        {...register('phone')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user?.email || ''}
                        disabled
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{ mt: 3 }}
                  >
                    Сохранить изменения
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Фамилия
                    </Typography>
                    <Typography variant="body1">{user?.lastName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Имя
                    </Typography>
                    <Typography variant="body1">{user?.firstName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Отчество
                    </Typography>
                    <Typography variant="body1">{user?.patronymic || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Телефон
                    </Typography>
                    <Typography variant="body1">{user?.phone || '—'}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Смена пароля */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Безопасность
                </Typography>
                <Button
                  variant={isChangingPassword ? 'outlined' : 'contained'}
                  onClick={() => {
                    setIsChangingPassword(!isChangingPassword);
                    if (!isChangingPassword) {
                      resetPassword();
                    }
                  }}
                >
                  {isChangingPassword ? 'Отмена' : 'Изменить пароль'}
                </Button>
              </Box>

              {isChangingPassword && (
                <Box component="form" onSubmit={handlePasswordSubmit(onSubmitPassword)}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    После изменения пароля вам потребуется войти в систему заново.
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Текущий пароль"
                        type="password"
                        {...registerPassword('currentPassword', { required: 'Текущий пароль обязателен' })}
                        error={!!passwordErrors.currentPassword}
                        helperText={passwordErrors.currentPassword?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Новый пароль"
                        type="password"
                        {...registerPassword('newPassword', {
                          required: 'Новый пароль обязателен',
                          minLength: {
                            value: 8,
                            message: 'Минимум 8 символов',
                          },
                        })}
                        error={!!passwordErrors.newPassword}
                        helperText={passwordErrors.newPassword?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Подтверждение пароля"
                        type="password"
                        {...registerPassword('confirmPassword', {
                          required: 'Подтверждение обязательно',
                          validate: (value) =>
                            value === password || 'Пароли не совпадают',
                        })}
                        error={!!passwordErrors.confirmPassword}
                        helperText={passwordErrors.confirmPassword?.message}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{ mt: 3 }}
                  >
                    Изменить пароль
                  </Button>
                </Box>
              )}

              {!isChangingPassword && (
                <Typography variant="body2" color="text.secondary">
                  Для изменения пароля нажмите кнопку «Изменить пароль»
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;

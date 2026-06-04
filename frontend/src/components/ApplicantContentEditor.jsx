/**
 * Редактор контента лендинга абитуриента (для админ-панели)
 * @module components/ApplicantContentEditor
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Stack,
  Divider,
  IconButton,
  Alert,
  Chip,
  FormControl,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { getApplicantContent, updateApplicantContent } from '../api/applicantContent';

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

const EMPTY_PROGRAM = {
  code: '',
  name: '',
  level: 'Бакалавриат',
  duration: '4 года',
  places: 0,
  exams: [''],
};

const EMPTY_TIMELINE = { label: '', desc: '' };
const EMPTY_DOC = { name: '', required: true };
const EMPTY_FAQ = { q: '', a: '' };

function ApplicantContentEditor() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicantContent();
      setContent(data);
    } catch (e) {
      setError('Не удалось загрузить контент');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayField = (field, index, key, value) => {
    setContent((prev) => {
      const arr = [...(prev[field] || [])];
      arr[index] = key ? { ...arr[index], [key]: value } : value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field, item) => {
    setContent((prev) => ({ ...prev, [field]: [...(prev[field] || []), item] }));
  };

  const removeArrayItem = (field, index) => {
    setContent((prev) => {
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateApplicantContent(content);
      setContent(updated);
      setSuccess('Контент сохранён');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return <Typography>Загрузка…</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Редактирование лендинга абитуриента</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ViewIcon />}
            onClick={() => window.open('/applicant', '_blank')}
          >
            Предпросмотр
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Сохранение…' : 'Сохранить всё'}
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Hero" />
          <Tab label="Программы" />
          <Tab label="Сроки" />
          <Tab label="Документы" />
          <Tab label="Общежитие" />
          <Tab label="Преимущества" />
          <Tab label="FAQ" />
          <Tab label="Контакты" />
          <Tab label="Статистика" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {/* Hero */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Бейдж (над заголовком)" value={content.heroBadge || ''} onChange={(e) => handleChange('heroBadge', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Год приёма" value={content.admissionYear || 2026} onChange={(e) => handleChange('admissionYear', parseInt(e.target.value, 10))} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Заголовок H1" value={content.heroTitle || ''} onChange={(e) => handleChange('heroTitle', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Подзаголовок H5" value={content.heroSubtitle || ''} onChange={(e) => handleChange('heroSubtitle', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={3} label="Описание" value={content.heroDescription || ''} onChange={(e) => handleChange('heroDescription', e.target.value)} />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Programs */}
          <TabPanel value={tab} index={1}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Направления подготовки
              </Typography>
              <Button startIcon={<AddIcon />} onClick={() => addArrayItem('programs', { ...EMPTY_PROGRAM })}>
                Добавить
              </Button>
            </Stack>
            {(content.programs || []).map((p, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Chip label={`#${idx + 1}`} color="primary" size="small" />
                  <IconButton color="error" onClick={() => removeArrayItem('programs', idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField fullWidth size="small" label="Код (XX.XX.XX)" value={p.code || ''} onChange={(e) => handleArrayField('programs', idx, 'code', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Название" value={p.name || ''} onChange={(e) => handleArrayField('programs', idx, 'name', e.target.value)} />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField fullWidth size="small" label="Уровень" value={p.level || ''} onChange={(e) => handleArrayField('programs', idx, 'level', e.target.value)} />
                  </Grid>
                  <Grid item xs={6} md={1}>
                    <TextField fullWidth size="small" type="number" label="Мест" value={p.places || 0} onChange={(e) => handleArrayField('programs', idx, 'places', parseInt(e.target.value, 10))} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Длительность" value={p.duration || ''} onChange={(e) => handleArrayField('programs', idx, 'duration', e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Экзамены (по одному на строку):</Typography>
                    <TextField
                      fullWidth size="small" multiline minRows={2}
                      value={(p.exams || []).join('\n')}
                      onChange={(e) => handleArrayField('programs', idx, 'exams', e.target.value.split('\n').filter(Boolean))}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </TabPanel>

          {/* Timeline */}
          <TabPanel value={tab} index={2}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Сроки приёма</Typography>
              <Button startIcon={<AddIcon />} onClick={() => addArrayItem('timeline', { ...EMPTY_TIMELINE })}>
                Добавить этап
              </Button>
            </Stack>
            {(content.timeline || []).map((t, idx) => (
              <Stack key={idx} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                <TextField size="small" label="Дата/этап" value={t.label || ''} onChange={(e) => handleArrayField('timeline', idx, 'label', e.target.value)} sx={{ minWidth: 200 }} />
                <TextField size="small" fullWidth label="Описание" value={t.desc || ''} onChange={(e) => handleArrayField('timeline', idx, 'desc', e.target.value)} />
                <IconButton color="error" onClick={() => removeArrayItem('timeline', idx)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </TabPanel>

          {/* Documents */}
          <TabPanel value={tab} index={3}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Документы для поступления</Typography>
              <Button startIcon={<AddIcon />} onClick={() => addArrayItem('documents', { ...EMPTY_DOC })}>
                Добавить документ
              </Button>
            </Stack>
            {(content.documents || []).map((d, idx) => (
              <Stack key={idx} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                <TextField size="small" fullWidth label="Название документа" value={d.name || ''} onChange={(e) => handleArrayField('documents', idx, 'name', e.target.value)} />
                <FormControlLabel
                  control={<Switch checked={!!d.required} onChange={(e) => handleArrayField('documents', idx, 'required', e.target.checked)} />}
                  label={d.required ? 'Обяз.' : 'Опц.'}
                />
                <IconButton color="error" onClick={() => removeArrayItem('documents', idx)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </TabPanel>

          {/* Dorm */}
          <TabPanel value={tab} index={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={2} label="Описание общежития" value={content.dormDescription || ''} onChange={(e) => handleChange('dormDescription', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Стоимость" value={content.dormCost || ''} onChange={(e) => handleChange('dormCost', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Адрес" value={content.dormAddress || ''} onChange={(e) => handleChange('dormAddress', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Особенности</Typography>
                  <Button startIcon={<AddIcon />} size="small" onClick={() => addArrayItem('dormFeatures', { text: '' })}>
                    Добавить
                  </Button>
                </Stack>
                {(content.dormFeatures || []).map((f, idx) => (
                  <Stack key={idx} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                    <TextField size="small" fullWidth label={`Особенность #${idx + 1}`} value={f.text || ''} onChange={(e) => handleArrayField('dormFeatures', idx, 'text', e.target.value)} />
                    <IconButton color="error" onClick={() => removeArrayItem('dormFeatures', idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Benefits */}
          <TabPanel value={tab} index={5}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Преимущества</Typography>
              <Button startIcon={<AddIcon />} onClick={() => addArrayItem('benefits', { title: '', text: '' })}>
                Добавить
              </Button>
            </Stack>
            {(content.benefits || []).map((b, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Chip label={`#${idx + 1}`} size="small" color="primary" />
                  <IconButton color="error" size="small" onClick={() => removeArrayItem('benefits', idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                <TextField fullWidth size="small" label="Заголовок" value={b.title || ''} onChange={(e) => handleArrayField('benefits', idx, 'title', e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth size="small" multiline minRows={2} label="Описание" value={b.text || ''} onChange={(e) => handleArrayField('benefits', idx, 'text', e.target.value)} />
              </Paper>
            ))}
          </TabPanel>

          {/* FAQ */}
          <TabPanel value={tab} index={6}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">FAQ</Typography>
              <Button startIcon={<AddIcon />} onClick={() => addArrayItem('faq', { ...EMPTY_FAQ })}>
                Добавить вопрос
              </Button>
            </Stack>
            {(content.faq || []).map((f, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Chip label={`#${idx + 1}`} size="small" color="primary" />
                  <IconButton color="error" size="small" onClick={() => removeArrayItem('faq', idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                <TextField fullWidth size="small" label="Вопрос" value={f.q || ''} onChange={(e) => handleArrayField('faq', idx, 'q', e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth size="small" multiline minRows={2} label="Ответ" value={f.a || ''} onChange={(e) => handleArrayField('faq', idx, 'a', e.target.value)} />
              </Paper>
            ))}
          </TabPanel>

          {/* Contacts */}
          <TabPanel value={tab} index={7}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Адрес" value={content.contactAddress || ''} onChange={(e) => handleChange('contactAddress', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Телефон" value={content.contactPhone || ''} onChange={(e) => handleChange('contactPhone', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Email" value={content.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Часы работы" value={content.contactHours || ''} onChange={(e) => handleChange('contactHours', e.target.value)} />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Stats */}
          <TabPanel value={tab} index={8}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Блоки статистики</Typography>
              <Button startIcon={<AddIcon />} onClick={() => addArrayItem('stats', { value: '', label: '' })}>
                Добавить
              </Button>
            </Stack>
            {(content.stats || []).map((s, idx) => (
              <Stack key={idx} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                <TextField size="small" label="Значение" value={s.value || ''} onChange={(e) => handleArrayField('stats', idx, 'value', e.target.value)} sx={{ width: 150 }} />
                <TextField size="small" fullWidth label="Подпись" value={s.label || ''} onChange={(e) => handleArrayField('stats', idx, 'label', e.target.value)} />
                <IconButton color="error" onClick={() => removeArrayItem('stats', idx)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default ApplicantContentEditor;

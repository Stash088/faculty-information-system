const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireAdmin, requireMethodist, requireMaterialOwnerOrAdmin } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');
const contentController = require('../controllers/contentController');
const categoryController = require('../controllers/categoryController');

// News
router.get('/news', contentController.getNews);
router.post('/news', authenticate, requireAdmin, contentController.createNews);
router.put('/news/:id', authenticate, requireAdmin, contentController.updateNews);
router.delete('/news/:id', authenticate, requireAdmin, contentController.deleteNews);

// Courses (admin + methodist могут управлять учебными программами — ФТ-М1)
router.get('/courses', contentController.getCourses);
router.post('/courses', authenticate, requireMethodist, contentController.createCourse);
router.put('/courses/:id', authenticate, requireMethodist, contentController.updateCourse);
router.delete('/courses/:id', authenticate, requireAdmin, contentController.deleteCourse);

// Materials — создавать/редактировать могут admin/teacher/methodist с проверкой ownership (ФТ-П2)
router.get('/materials', contentController.getMaterials);
router.post('/materials', authenticate, requireMaterialOwnerOrAdmin, upload.single('file'), contentController.createMaterial);
router.put('/materials/:id', authenticate, requireMaterialOwnerOrAdmin, upload.single('file'), contentController.updateMaterial);
router.get('/materials/:id/download', optionalAuth, contentController.downloadMaterial);
router.get('/materials/:id/view', optionalAuth, contentController.viewMaterial);
router.delete('/materials/:id', authenticate, requireAdmin, contentController.deleteMaterial);

// Schedule (CRUD)
router.get('/schedule', contentController.getSchedule);
router.get('/schedule/ical', contentController.getScheduleIcal);
router.post('/schedule', authenticate, requireAdmin, contentController.createSchedule);
router.put('/schedule/:id', authenticate, requireAdmin, contentController.updateSchedule);
router.delete('/schedule/:id', authenticate, requireAdmin, contentController.deleteSchedule);

// Departments
router.get('/departments', contentController.getDepartments);
router.post('/departments', authenticate, requireAdmin, contentController.createDepartment);
router.put('/departments/:id', authenticate, requireAdmin, contentController.updateDepartment);
router.delete('/departments/:id', authenticate, requireAdmin, contentController.deleteDepartment);

// Groups
router.get('/groups', contentController.getGroups);
router.post('/groups', authenticate, requireAdmin, contentController.createGroup);
router.put('/groups/:id', authenticate, requireAdmin, contentController.updateGroup);
router.delete('/groups/:id', authenticate, requireAdmin, contentController.deleteGroup);

// Teachers
router.get('/teachers', contentController.getTeachers);

// Categories (CRUD для категорий материалов)
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategory);
router.post('/categories', authenticate, requireAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;

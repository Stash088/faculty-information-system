const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const contentController = require('../controllers/contentController');

// News
router.get('/news', contentController.getNews);
router.post('/news', authenticate, requireAdmin, contentController.createNews);
router.put('/news/:id', authenticate, requireAdmin, contentController.updateNews);
router.delete('/news/:id', authenticate, requireAdmin, contentController.deleteNews);

// Courses
router.get('/courses', contentController.getCourses);
router.post('/courses', authenticate, requireAdmin, contentController.createCourse);
router.put('/courses/:id', authenticate, requireAdmin, contentController.updateCourse);
router.delete('/courses/:id', authenticate, requireAdmin, contentController.deleteCourse);

// Materials
router.get('/materials', contentController.getMaterials);
router.post('/materials', authenticate, contentController.createMaterial);
router.delete('/materials/:id', authenticate, requireAdmin, contentController.deleteMaterial);

// Schedule (CRUD)
router.get('/schedule', contentController.getSchedule);
router.post('/schedule', authenticate, requireAdmin, contentController.createSchedule);
router.put('/schedule/:id', authenticate, requireAdmin, contentController.updateSchedule);
router.delete('/schedule/:id', authenticate, requireAdmin, contentController.deleteSchedule);

// Departments
router.get('/departments', contentController.getDepartments);

// Groups
router.get('/groups', contentController.getGroups);

// Teachers
router.get('/teachers', contentController.getTeachers);

module.exports = router;

/**
 * Инициализация связей между моделями
 * @module models
 */

const { sequelize } = require('../config/database');

// Импорт моделей
const Role = require('./Role');
const User = require('./User');
const Course = require('./Course');
const Material = require('./Material');
const Schedule = require('./Schedule');
const News = require('./News');
const Group = require('./Group');
const Department = require('./Department');
const RefreshToken = require('./RefreshToken');
const PasswordResetToken = require('./PasswordResetToken');
const ApplicantContent = require('./ApplicantContent');
const Category = require('./Category');

// Role -> Users (one-to-many)
Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users',
});
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role',
});

// Department -> Groups (one-to-many)
Department.hasMany(Group, {
  foreignKey: 'departmentId',
  as: 'groups',
});
Group.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});

// Department -> Courses (one-to-many)
Department.hasMany(Course, {
  foreignKey: 'departmentId',
  as: 'courses',
});
Course.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});

// Department -> Users (one-to-many)
Department.hasMany(User, {
  foreignKey: 'departmentId',
  as: 'employees',
});
User.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});

// Course -> Materials (one-to-many)
Course.hasMany(Material, {
  foreignKey: 'courseId',
  as: 'materials',
});
Material.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

// User (Teacher) -> Materials (one-to-many)
User.hasMany(Material, {
  foreignKey: 'teacherId',
  as: 'uploadedMaterials',
});
Material.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

// Category -> Materials (one-to-many)
Category.hasMany(Material, {
  foreignKey: 'categoryId',
  as: 'materials',
});
Material.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// Course -> Schedules (one-to-many)
Course.hasMany(Schedule, {
  foreignKey: 'courseId',
  as: 'schedules',
});
Schedule.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
});

// User (Teacher) -> Schedules (one-to-many)
User.hasMany(Schedule, {
  foreignKey: 'teacherId',
  as: 'teachingSchedule',
});
Schedule.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

// Group -> Schedules (one-to-many)
Group.hasMany(Schedule, {
  foreignKey: 'groupId',
  as: 'schedules',
});
Schedule.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group',
});

// User (Teacher) -> Courses (one-to-many)
User.hasMany(Course, {
  foreignKey: 'teacherId',
  as: 'teachingCourses',
});
Course.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'courseTeacher',
});

// News -> User (Author) (one-to-many)
User.hasMany(News, {
  foreignKey: 'authorId',
  as: 'publishedNews',
});
News.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
});

// Group -> Users (one-to-many)
Group.hasMany(User, {
  foreignKey: 'groupId',
  as: 'students',
});
User.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'studentGroup',
});

// User -> RefreshTokens (one-to-many)
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
});
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// User -> PasswordResetTokens (one-to-many)
User.hasMany(PasswordResetToken, {
  foreignKey: 'userId',
  as: 'passwordResetTokens',
});
PasswordResetToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✓ Модели синхронизированы с базой данных');
  } catch (error) {
    console.error('✗ Ошибка синхронизации моделей:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  Role,
  User,
  Course,
  Material,
  Schedule,
  News,
  Group,
  Department,
  RefreshToken,
  PasswordResetToken,
  ApplicantContent,
  Category,
  syncModels,
};
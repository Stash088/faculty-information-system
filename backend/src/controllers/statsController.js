const { User, Course, Material, News, Schedule } = require('../models');

// Получение статистики для дашборда
exports.getStats = async (req, res, next) => {
  try {
    const [
      usersCount,
      coursesCount,
      materialsCount,
      newsCount,
      schedulesCount,
    ] = await Promise.all([
      User.count(),
      Course.count(),
      Material.count(),
      News.count(),
      Schedule.count(),
    ]);

    res.json({
      users: usersCount,
      courses: coursesCount,
      materials: materialsCount,
      news: newsCount,
      schedules: schedulesCount,
    });
  } catch (error) {
    next(error);
  }
};

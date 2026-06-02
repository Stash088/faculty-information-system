/**
 * Конфигурация аутентификации
 * @module config/auth
 */

require('dotenv').config();

module.exports = {
  /**
   * JWT Access Token - короткоживущий токен для доступа к ресурсам
   */
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_change_in_production',
  
  /**
   * JWT Refresh Token - долгоживущий токен для обновления access token
   */
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_in_production',
  
  /**
   * Время жизни access token (по умолчанию 15 минут)
   */
  accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  
  /**
   * Время жизни refresh token (по умолчанию 30 дней)
   */
  refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  
  /**
   * Максимальное количество попыток входа
   */
  maxLoginAttempts: 5,
  
  /**
   * Время блокировки после превышения попыток (в минутах)
   */
  lockoutDuration: 15,
  
  /**
   * Минимальная длина пароля
   */
  minPasswordLength: 8,
  
  /**
   * Время бездействия до自动ного выхода (в минутах)
   */
  sessionTimeout: 30,
};

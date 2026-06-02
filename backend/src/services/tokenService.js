/**
 * Сервис для работы с JWT токенами
 * @module services/tokenService
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authConfig = require('../config/auth');
const { RefreshToken } = require('../models');

class TokenService {
  /**
   * Генерация access и refresh токенов
   * @param {Object} payload - Данные пользователя
   * @returns {Object} - Объект с токенами
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, authConfig.accessSecret, {
      expiresIn: authConfig.accessExpires,
    });

    const refreshToken = jwt.sign(
      { ...payload, tokenId: uuidv4() },
      authConfig.refreshSecret,
      { expiresIn: authConfig.refreshExpires }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Валидация access токена
   * @param {string} token - Access токен
   * @returns {Object|null} - Декодированные данные или null
   */
  validateAccessToken(token) {
    try {
      return jwt.verify(token, authConfig.accessSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Валидация refresh токена
   * @param {string} token - Refresh токен
   * @returns {Object|null} - Декодированные данные или null
   */
  validateRefreshToken(token) {
    try {
      return jwt.verify(token, authConfig.refreshSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Сохранение refresh токена в базу данных
   * @param {number} userId - ID пользователя
   * @param {string} refreshToken - Refresh токен
   * @param {Object} deviceInfo - Информация об устройстве
   * @returns {Promise<RefreshToken>}
   */
  async saveToken(userId, refreshToken, deviceInfo = {}) {
    // Находим время истечения из токена
    const decoded = jwt.decode(refreshToken);
    const expiresAt = new Date(decoded.exp * 1000);

    // Удаляем старые токены пользователя
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } }
    );

    // Создаём новый токен
    const token = await RefreshToken.create({
      token: refreshToken,
      userId,
      expiresAt,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
    });

    return token;
  }

  /**
   * Поиск refresh токена в базе данных
   * @param {string} token - Refresh токен
   * @returns {Promise<RefreshToken|null>}
   */
  async findToken(token) {
    return RefreshToken.findOne({
      where: { token, isRevoked: false },
    });
  }

  /**
   * Пометить токен как использованный
   * @param {string} token - Refresh токен
   * @returns {Promise<void>}
   */
  async markTokenAsUsed(token) {
    await RefreshToken.update(
      { isUsed: true },
      { where: { token } }
    );
  }

  /**
   * Отозвать токен
   * @param {string} token - Refresh токен
   * @returns {Promise<void>}
   */
  async revokeToken(token) {
    await RefreshToken.update(
      { isRevoked: true },
      { where: { token } }
    );
  }

  /**
   * Отозвать все токены пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async revokeAllUserTokens(userId) {
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } }
    );
  }

  /**
   * Очистка просроченных токенов
   * @returns {Promise<number>} - Количество удалённых токенов
   */
  async cleanupExpiredTokens() {
    const deleted = await RefreshToken.destroy({
      where: {
        expiresAt: {
          [require('sequelize').Op.lt]: new Date(),
        },
      },
    });
    return deleted;
  }
}

module.exports = new TokenService();

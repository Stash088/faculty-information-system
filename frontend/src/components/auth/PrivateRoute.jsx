/**
 * Protected Route компонент для авторизованных пользователей
 * @module components/auth/PrivateRoute
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // Если токен есть в localStorage, считаем авторизованным
  const hasToken = localStorage.getItem('accessToken');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;

import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
}

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const isAdmin = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.roles.includes('ROLE_ADMIN');
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect based on user role
    if (user?.role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/manager');
    }
  }, [isAuthenticated, user, navigate]);

  return null;
}

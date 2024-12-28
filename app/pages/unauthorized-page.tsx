import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ErrorMessage } from '../components/ui/error-message';
import { SupportContact } from '../components/ui/support-contact';
import { AlertTriangle, Clock } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSupport, setShowSupport] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [timeLeft, navigate]);

  const getErrorDetails = () => {
    const path = location.state?.from || location.pathname;
    const role = location.state?.requiredRole;

    if (role) {
      return {
        title: "Accès Restreint",
        message: `Cette page nécessite le rôle "${role}" pour y accéder. Contactez votre administrateur pour obtenir les autorisations nécessaires.`
      };
    }

    return {
      title: "Accès Non Autorisé",
      message: `Vous n'avez pas les permissions nécessaires pour accéder à la page "${path}". Vérifiez vos autorisations ou contactez le support.`
    };
  };

  const { title, message } = getErrorDetails();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 animate-fadeIn">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center animate-slideIn">
          <div className="mx-auto h-24 w-24 text-yellow-500 animate-bounce">
            <AlertTriangle size={96} />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            {title}
          </h1>
        </div>

        <ErrorMessage
          title="Détails de l'erreur"
          message={message}
          className="animate-slideIn"
        />

        <div className="flex items-center justify-center text-sm text-gray-500 animate-fadeIn">
          <Clock className="h-4 w-4 mr-2" />
          Redirection automatique dans {timeLeft} secondes
        </div>

        <div className="flex flex-col gap-4 animate-slideIn">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate(-1)} variant="outline">
              Retour
            </Button>
            <Button onClick={() => navigate('/')}>
              Accueil
            </Button>
          </div>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowSupport(true)}
              className="text-sm"
            >
              Besoin d'aide ? Contactez le support
            </Button>
          </div>
        </div>
      </div>

      {showSupport && (
        <SupportContact onClose={() => setShowSupport(false)} />
      )}
    </div>
  );
};

export default UnauthorizedPage;


import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './HomePage';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Make sure we navigate to the root on component mount
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate]);

  // Instead of returning null, render the HomePage component
  return <HomePage />;
};

export default Index;

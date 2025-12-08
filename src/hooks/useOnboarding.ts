import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = 'plenne_onboarding_completed';
const TOUR_KEY = 'plenne_tour_completed';

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      const storageKey = `${ONBOARDING_KEY}_${user.id}`;
      const tourKey = `${TOUR_KEY}_${user.id}`;
      
      const onboardingCompleted = localStorage.getItem(storageKey);
      const tourCompleted = localStorage.getItem(tourKey);
      
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      } else if (!tourCompleted) {
        // Delay tour to let page render
        setTimeout(() => setShowTour(true), 1000);
      }
      
      setIsReady(true);
    }
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, 'true');
      setShowOnboarding(false);
      // Start tour after onboarding
      setTimeout(() => setShowTour(true), 500);
    }
  };

  const completeTour = () => {
    if (user) {
      localStorage.setItem(`${TOUR_KEY}_${user.id}`, 'true');
      setShowTour(false);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const resetOnboarding = () => {
    if (user) {
      localStorage.removeItem(`${ONBOARDING_KEY}_${user.id}`);
      localStorage.removeItem(`${TOUR_KEY}_${user.id}`);
      setShowOnboarding(true);
      setShowTour(false);
    }
  };

  const startTour = () => {
    setShowTour(true);
  };

  return {
    showOnboarding,
    showTour,
    isReady,
    completeOnboarding,
    completeTour,
    skipTour,
    resetOnboarding,
    startTour
  };
}

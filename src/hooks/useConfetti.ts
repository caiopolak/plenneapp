import { useCallback } from 'react';
import confetti from 'canvas-confetti';

type ConfettiType = 'celebration' | 'goal' | 'achievement' | 'subtle';

export function useConfetti() {
  const fire = useCallback((type: ConfettiType = 'celebration') => {
    const configs: Record<ConfettiType, () => void> = {
      celebration: () => {
        // Big celebration with multiple bursts
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => 
          Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);

          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);
      },

      goal: () => {
        // Goal completion - golden confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B'],
          zIndex: 10000
        });
      },

      achievement: () => {
        // Achievement unlocked - stars
        const defaults = {
          spread: 360,
          ticks: 100,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          shapes: ['star'] as confetti.Shape[],
          colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
          zIndex: 10000
        };

        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          origin: { x: 0.5, y: 0.5 }
        });

        confetti({
          ...defaults,
          particleCount: 20,
          scalar: 0.75,
          origin: { x: 0.5, y: 0.5 }
        });
      },

      subtle: () => {
        // Subtle celebration
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
          gravity: 1.5,
          scalar: 0.8,
          zIndex: 10000
        });
      }
    };

    configs[type]();
  }, []);

  const fireGoalComplete = useCallback(() => fire('goal'), [fire]);
  const fireAchievement = useCallback(() => fire('achievement'), [fire]);
  const fireCelebration = useCallback(() => fire('celebration'), [fire]);
  const fireSubtle = useCallback(() => fire('subtle'), [fire]);

  return {
    fire,
    fireGoalComplete,
    fireAchievement,
    fireCelebration,
    fireSubtle
  };
}

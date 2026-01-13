import { useEffect, useState } from "react";
import haversine from "haversine-distance";

export default function useNavigationEngine(routeSteps, userLocation) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(null);

  useEffect(() => {
    if (!routeSteps?.length || !userLocation) return;

    const step = routeSteps[currentStepIndex];
    if (!step) return;

    const distance = haversine(
      userLocation,
      step.end_location
    );

    if (distance < 15 && currentStepIndex < routeSteps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    }

    setCurrentInstruction({
      text: step.html_instructions.replace(/<[^>]+>/g, ""),
      distance: step.distance.text,
      maneuver: step.maneuver,
    });

  }, [userLocation, routeSteps]);

  return {
    currentInstruction,
    currentStepIndex,
  };
}

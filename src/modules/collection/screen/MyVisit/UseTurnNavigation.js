import { useState, useEffect, useRef } from "react";
import haversine from "haversine-distance";

export default function UseTurnNavigation({
  steps = [],
  userLocation,
  arrivalRadius = 20,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [distanceLeft, setDistanceLeft] = useState(null);

  const arrivedRef = useRef(false);

  /* Reset when route changes */
  useEffect(() => {
    setCurrentStepIndex(0);
    arrivedRef.current = false;
  }, [steps]);

  /* Track user movement */
  useEffect(() => {
    if (!userLocation || !steps.length) return;

    const step = steps[currentStepIndex];
    if (!step?.end_location) return;

    const stepEnd = {
      latitude: step.end_location.lat,
      longitude: step.end_location.lng,
    };

    const dist = haversine(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      stepEnd
    );

    setDistanceLeft(Math.round(dist));
    setInstruction(step.html_instructions || "");

    /* Advance to next step */
    if (dist < arrivalRadius && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
      return;
    }

    /* Final arrival */
    if (
      dist < arrivalRadius &&
      currentStepIndex === steps.length - 1 &&
      !arrivedRef.current
    ) {
      arrivedRef.current = true;
      console.log("🎉 Arrived at destination");
    }
  }, [userLocation, steps, currentStepIndex, arrivalRadius]);

  return {
    instruction: instruction.replace(/<[^>]+>/g, ""),
    distanceLeft,
    stepIndex: currentStepIndex,
    isLastStep: currentStepIndex === steps.length - 1,
  };
}

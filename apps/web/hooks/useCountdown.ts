import { useEffect, useState } from "react";
import dayjs from "dayjs";

export function useCountdown(targetDate: dayjs.Dayjs | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    // Only run the effect if the targetDate is valid
    if (!targetDate) {
      setSecondsLeft(0);
      return;
    }

    // Set the initial value immediately
    const initialDiff = targetDate.diff(dayjs(), "seconds");
    if (initialDiff > 0) {
      setSecondsLeft(initialDiff);
    }

    // Set up the interval to update the countdown every second
    const interval = setInterval(() => {
      const diff = targetDate.diff(dayjs(), "seconds");

      if (diff >= 0) {
        setSecondsLeft(diff);
      } else {
        // Stop the interval once the countdown is finished
        clearInterval(interval);
        setSecondsLeft(0);
      }
    }, 1000);

    // The cleanup function that React will run when the component
    // unmounts or when the `targetDate` dependency changes.
    return () => {
      clearInterval(interval);
    };
  }, [targetDate]); // Rerun this effect if targetDate changes

  return secondsLeft;
}

import { LazyMotion, m, Transition } from "framer-motion";

import { useTheme } from "@app/context/ThemeContext";

export function LoadingThreeDotsWave() {
  const { theme } = useTheme();

  const loadingContainer = {
    width: "2.5rem",
    height: "1rem",
    display: "flex",
    justifyContent: "space-around"
  };

  const loadingCircle = {
    display: "block",
    width: "0.5rem",
    height: "0.5rem",
    backgroundColor: theme === "light" ? "black" : "white",
    borderRadius: "0.25rem"
  };

  const loadingContainerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2
      }
    },
    end: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const loadingCircleVariants = {
    start: {
      y: "0%"
    },
    end: {
      y: "100%"
    }
  };

  const loadingCircleTransition: Transition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut"
  };

  return (
    <LazyMotion
      features={() =>
        import("@app/utils/load-motion-features").then((res) => res.default)
      }
    >
      <m.div
        style={loadingContainer}
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
      >
        <m.span
          style={loadingCircle}
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        <m.span
          style={loadingCircle}
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        <m.span
          style={loadingCircle}
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
      </m.div>
    </LazyMotion>
  );
}

import { Box } from "@mantine/core";

import { Heading } from "@/components/Heading/Heading";
import { LanderCallToActionSection } from "@/components/Lander/CallToActionSection";
import { LanderLayout } from "@/components/Lander/Layout";
import { YouTubePlayer } from "@/components/YoutubePlayer/YoutubePlayer";

import classes from "./page.module.css";

const simulationVideos = [
  {
    title: "ACPYPE Simulation",
    suffix: "1",
    videoId: "wwlZOixBHe8",
  },
  {
    title: "ACPYPE Simulation Preparation",
    suffix: "2",
    videoId: "t0KfsNX2LgQ",
  },
  {
    title: "APO Simulation",
    suffix: "3",
    videoId: "4icOoqJlWnA",
  },
  {
    title: "Download Simulation Results",
    suffix: "4",
    videoId: "kfruw1E8ZEo",
  },
];

export default function GuidesPage() {
  return (
    <LanderLayout>
      <Heading title="Guides" />
      <Box className={classes.videosContainer}>
        {simulationVideos.map((video) => (
          <YouTubePlayer
            key={video.videoId}
            uniquePlayerIdSuffix={video.suffix}
            videoId={video.videoId}
          />
        ))}
      </Box>
      <LanderCallToActionSection />
    </LanderLayout>
  );
}

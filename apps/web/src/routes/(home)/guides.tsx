import classes from "./guides.module.css";

import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderLayout } from "./-components/Layout";

import { Heading } from "@/components/Heading";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import { GUIDES_SEO } from "@/lib/seo";

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

export const Route = createFileRoute("/(home)/guides")({
  head: () => GUIDES_SEO,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Heading centered order={1} title="Guides" />
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

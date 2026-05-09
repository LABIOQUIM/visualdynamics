import classes from "./guides.module.css";

import { Box } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderLayout } from "./-components/Layout";

import { Heading } from "@/components/Heading";
import { YouTubePlayer } from "@/components/YoutubePlayer";
import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

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
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "Simulation Guides",
      description:
        "Watch step-by-step video guides for Visual Dynamics simulation setup, ACPYPE workflows, APO simulations, and result downloads.",
      path: "/guides",
      index: true,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Heading centered title="Guides" />
      <Box className={classes.videosContainer}>
        {simulationVideos.map((video) => (
          <YouTubePlayer
            key={video.videoId}
            title={video.title}
            uniquePlayerIdSuffix={video.suffix}
            videoId={video.videoId}
          />
        ))}
      </Box>
      <LanderCallToActionSection />
    </LanderLayout>
  );
}

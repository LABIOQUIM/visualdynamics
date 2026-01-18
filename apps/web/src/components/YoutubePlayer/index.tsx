import { useCallback, useEffect, useRef } from "react";

interface YouTubePlayerProps {
  videoId: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  uniquePlayerIdSuffix: string;
}

let isApiLoaded = false;
let apiPromise: Promise<void> | null = null;
const playerQueue: Array<() => void> = [];

function ensureYouTubeApiReady(): Promise<void> {
  if (isApiLoaded && window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<void>((resolve, reject) => {
    // Check if script tag already exists (e.g., from another instance)
    if (
      document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    ) {
      // If script tag exists but YT is not ready, means it's still loading
      // We rely on the global onYouTubeIframeAPIReady to be set by the first loader
      // This part might need refinement if script exists but YT is not ready yet.
      // The ideal is that only one instance ever *creates* the script tag.
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag); // Fallback if no script tags
      }
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady && typeof previousOnReady === "function") {
        previousOnReady(); // Call any previously defined ready function
      }
      isApiLoaded = true;
      resolve();
      // Process any queued players
      while (playerQueue.length) {
        const initFn = playerQueue.shift();
        if (initFn) initFn();
      }
    };

    // Timeout for API load failure
    setTimeout(() => {
      if (!isApiLoaded) {
        console.error("YouTube API failed to load within timeout.");
        reject(new Error("YouTube API load timeout"));
        apiPromise = null; // Reset promise so it can be tried again if needed
      }
    }, 10000); // 10 seconds timeout
  });

  return apiPromise;
}

export function YouTubePlayer({
  videoId,
  width = 768,
  height = 432,
  autoplay = false,
  uniquePlayerIdSuffix,
}: YouTubePlayerProps) {
  const playerId = `youtube-player-${uniquePlayerIdSuffix}`;
  const playerRef = useRef<HTMLDivElement | null>(null);
  // @ts-expect-error
  const ytPlayerInstanceRef = useRef<YT.Player | null>(null);

  const initializePlayer = useCallback(() => {
    if (!document.getElementById(playerId) || !videoId) {
      return;
    }

    if (ytPlayerInstanceRef.current) {
      ytPlayerInstanceRef.current.destroy();
      ytPlayerInstanceRef.current = null;
    }

    try {
      ytPlayerInstanceRef.current = new window.YT.Player(playerId, {
        videoId,
        width: String(width),
        height: String(height),
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 1,
          modestbranding: 0,
          rel: 1,
        },
      });
    } catch (error) {
      console.error(`Failed to create YT.Player for ${playerId}:`, error);
    }
  }, [playerId, videoId, width, height, autoplay, uniquePlayerIdSuffix]);

  useEffect(() => {
    let isMounted = true;

    const setupPlayer = () => {
      if (isMounted) {
        initializePlayer();
      }
    };

    ensureYouTubeApiReady()
      .then(() => {
        if (isApiLoaded && window.YT && window.YT.Player) {
          setupPlayer();
        } else {
          playerQueue.push(setupPlayer);
        }
      })
      .catch((error) => {
        console.error("Failed to ensure YouTube API readiness:", error);
      });

    return () => {
      isMounted = false;
      if (ytPlayerInstanceRef.current) {
        try {
          ytPlayerInstanceRef.current.destroy();
        } catch (e) {}
        ytPlayerInstanceRef.current = null;
      }
    };
  }, [initializePlayer]);

  return (
    <div
      id={playerId}
      ref={playerRef}
      style={{
        width: "100%",
        height: String(height),
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Placeholder content or loading indicator can go here */}
    </div>
  );
}

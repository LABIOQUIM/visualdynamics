interface YouTubePlayerProps {
  title: string;
  videoId: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  uniquePlayerIdSuffix: string;
}

export function YouTubePlayer({
  autoplay = false,
  height = 432,
  title,
  uniquePlayerIdSuffix,
  videoId,
  width = 768,
}: YouTubePlayerProps) {
  const playerId = `youtube-player-${uniquePlayerIdSuffix}`;
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);

  embedUrl.searchParams.set("controls", "1");
  embedUrl.searchParams.set("modestbranding", "1");
  embedUrl.searchParams.set("rel", "0");

  if (autoplay) {
    embedUrl.searchParams.set("autoplay", "1");
  }

  return (
    <div
      style={{
        width: "100%",
        height: String(height),
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        height={height}
        id={playerId}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={embedUrl.toString()}
        title={title}
        width={width}
      />
    </div>
  );
}

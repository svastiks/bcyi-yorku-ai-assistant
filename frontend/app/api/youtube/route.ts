import { NextResponse } from "next/server";

const CHANNEL_ID = "UCIP4Ue0786TuKD2WZwzt9OQ";
const YT_BASE = "https://www.googleapis.com/youtube/v3";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 500 }
    );
  }

  try {
    // 1. Fetch channel info
    const channelRes = await fetch(
      `${YT_BASE}/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${apiKey}`
    );
    if (!channelRes.ok) {
      const err = await channelRes.json();
      return NextResponse.json(
        { error: err.error?.message || "Failed to fetch channel data" },
        { status: channelRes.status }
      );
    }
    const channelData = await channelRes.json();
    const channelItem = channelData.items?.[0];
    if (!channelItem) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const channel = {
      name: channelItem.snippet.title,
      thumbnail: channelItem.snippet.thumbnails?.default?.url || "",
      subscriberCount: channelItem.statistics.subscriberCount || "0",
      viewCount: channelItem.statistics.viewCount || "0",
      videoCount: channelItem.statistics.videoCount || "0",
      channelUrl: `https://www.youtube.com/channel/${CHANNEL_ID}`,
    };

    // 2. Fetch last 5 video IDs
    const searchRes = await fetch(
      `${YT_BASE}/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=5&key=${apiKey}`
    );
    if (!searchRes.ok) {
      const err = await searchRes.json();
      return NextResponse.json(
        { error: err.error?.message || "Failed to fetch videos" },
        { status: searchRes.status }
      );
    }
    const searchData = await searchRes.json();
    const videoIds: string[] = (searchData.items || [])
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return NextResponse.json({ channel, videos: [] });
    }

    // 3. Fetch video details (statistics + snippet)
    const videosRes = await fetch(
      `${YT_BASE}/videos?part=statistics,snippet&id=${videoIds.join(",")}&key=${apiKey}`
    );
    if (!videosRes.ok) {
      const err = await videosRes.json();
      return NextResponse.json(
        { error: err.error?.message || "Failed to fetch video details" },
        { status: videosRes.status }
      );
    }
    const videosData = await videosRes.json();

    const videos = (videosData.items || []).map(
      (item: {
        id: string;
        snippet: {
          title: string;
          thumbnails: { medium?: { url: string }; default?: { url: string } };
          publishedAt: string;
        };
        statistics: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        viewCount: item.statistics.viewCount || "0",
        likeCount: item.statistics.likeCount || "0",
        commentCount: item.statistics.commentCount || "0",
        publishedAt: item.snippet.publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
      })
    );

    return NextResponse.json({ channel, videos });
  } catch (error) {
    console.error("[YouTube API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}

import { useState, useEffect } from "react";

const FACEBOOK_PAGE_ID = "YOUR_FACEBOOK_PAGE_ID";

const LivePlayer = () => {
  const [status, setStatus] = useState({
    youtube: { isLive: false, videoId: null },
    facebook: { isLive: false, liveVideoId: null },
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("http://localhost:3001/api/live-status");
      const data = await res.json();
      setStatus(data);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (status.youtube.isLive) {
    return (
      <iframe
        width="100%"
        height="500"
        src={`https://www.youtube.com/embed/${status.youtube.videoId}?autoplay=1`}
        title="YouTube Live"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  } else if (status.facebook.isLive) {
    return (
      <iframe
        width="100%"
        height="500"
        src={`https://www.facebook.com/${FACEBOOK_PAGE_ID}/videos/${status.facebook.liveVideoId}/`}
        title="Facebook Live"
        allowFullScreen
      />
    );
  } else {
    return <p>No live stream currently. Please check back later!</p>;
  }
};

export default LivePlayer;

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import "./Sermons.css";

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null); // 🎬 current video for modal
  const limit = 9;

  const API_URL = useMemo(() => process.env.REACT_APP_API_URL || "", []);

  const fetchSermons = useCallback(async (pageNum = 1) => {
    const cacheKey = `sermons_page_${pageNum}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setSermons((prev) =>
        pageNum === 1 ? parsed.sermons : [...prev, ...parsed.sermons]
      );
      setTotal(parsed.total);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/sermons?page=${pageNum}&limit=${limit}`,
        { signal: controller.signal }
      );
      const data = res.data;
      setSermons((prev) =>
        pageNum === 1 ? data.sermons : [...prev, ...data.sermons]
      );
      setTotal(data.total);
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ sermons: data.sermons, total: data.total })
      );
    } catch (err) {
      if (!axios.isCancel(err)) console.error("Error fetching sermons:", err);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [API_URL, limit]);

  useEffect(() => {
    fetchSermons(1);
  }, [fetchSermons]);

  const loadMore = () => {
    const nextPage = page + 1;
    fetchSermons(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="sermons-container">
      <h2 className="sermons-heading">Sermons</h2>

      <div className="sermons-grid">
        {sermons.map((s) => (
          <div
            key={s._id}
            className="sermon-card"
            onClick={() => setCurrentVideo(s)}
          >
            <img
              loading="lazy"
              src={s.thumbnail}
              alt={s.title}
              className="sermon-image"
            />
            <div className="sermon-info">
              <h3 className="sermon-title">{s.title}</h3>
              <p className="sermon-date">
                {new Date(s.publishedAt).toLocaleDateString()}
              </p>
              <p className="sermon-source">Source: {s.source?.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>

      {sermons.length < total && (
        <div className="sermons-load-more">
          <button
            onClick={loadMore}
            disabled={loading}
            className="load-more-btn"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {!loading && sermons.length === 0 && (
        <p className="no-sermons">No sermons found.</p>
      )}

      {/* Video Modal */}
      {currentVideo && (
        <div className="video-modal" onClick={() => setCurrentVideo(null)}>
          <div className="video-wrapper" onClick={(e) => e.stopPropagation()}>
            {currentVideo.source === "youtube" && (
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
                title={`YouTube video: ${currentVideo.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {currentVideo.source === "facebook" && (
              <iframe
                src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/${process.env.REACT_APP_FACEBOOK_PAGE_ID}/videos/${currentVideo.videoId}/&show_text=0&width=560`}
                width="100%"
                height="400"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title={`Facebook video: ${currentVideo.title}`}
              ></iframe>
            )}
            <button
              className="close-btn"
              onClick={() => setCurrentVideo(null)}
            >
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Sermons);

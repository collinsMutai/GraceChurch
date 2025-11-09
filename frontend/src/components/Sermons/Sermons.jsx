import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Button, Modal, Container } from "react-bootstrap"; // Bootstrap Modal
import InfiniteScroll from 'react-infinite-scroll-component';
import "./Sermons.css";

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [liveVideoUrl, setLiveVideoUrl] = useState(null);
  const limit = 8;
  const API_URL = useMemo(() => process.env.REACT_APP_API_URL || "", []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-KE", { month: "long" });
    const year = date.getFullYear();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    return `${day}${suffix} ${month} ${year}`;
  };

  const fetchLiveVideo = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/live-status`);
      if (res.data?.liveVideoUrl) {
        setLiveVideoUrl(res.data.liveVideoUrl);
      } else {
        setLiveVideoUrl(null);
      }
    } catch (err) {
      console.error("Error fetching live video:", err);
      setLiveVideoUrl(null);
    }
  }, [API_URL]);

  const fetchSermons = useCallback(
    async (pageNum = 1) => {
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
        console.log("Fetched Sermons:", data.sermons);
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Error fetching sermons:", err);
      } finally {
        setLoading(false);
      }

      return () => controller.abort();
    },
    [API_URL, limit]
  );

  useEffect(() => {
    fetchSermons(1); // Fetch first page of sermons
    fetchLiveVideo(); // Fetch live video URL
  }, [fetchSermons, fetchLiveVideo]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSermons(nextPage);
  };

  return (
    <Container>
      {/* Live Video Player */}
      {liveVideoUrl ? (
        <div className="live-video-container">
          <h2 className="text-center my-4">Live Video Stream</h2>
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              className="embed-responsive-item"
              src={liveVideoUrl}
              title="Live Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="no-live-feed">
          <h3 className="text-center my-4">No Live Feed Available</h3>
        </div>
      )}

      <h2 className="sermons-heading text-center my-4">Previous Sermons</h2>

      {/* Infinite Scroll */}
      <InfiniteScroll
        dataLength={sermons.length} // Length of the current list
        next={loadMore} // Function to load more sermons
        hasMore={sermons.length < total} // Whether more sermons are available
        loader={<h4>Loading...</h4>} // Loading message when more data is being fetched
        endMessage={<p className="text-center">No more sermons to show.</p>} // Message displayed when no more data is available
        scrollThreshold={0.9} // Trigger next fetch when 90% of the content is visible
      >
        <div className="sermons-grid">
          {sermons.map((s) => (
            <div key={s._id} className="sermon-card">
              {/* Video icon overlay */}
              <div
                className="video-icon"
                onClick={() => setCurrentVideo(s)}
                title="Play Video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon-tabler-video"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
                  <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                </svg>
              </div>

              <img
                loading="lazy"
                src={s.thumbnail}
                alt={s.title}
                className="sermon-image img-fluid"
              />
              <div className="sermon-info">
                <h3 className="sermon-title">{formatDate(s.publishedAt)}</h3>
                <p className="sermon-source">Source: {s.source?.toUpperCase()}</p>
                <p className="sermon-description">{s.description?.split("\n")[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {!loading && sermons.length === 0 && (
        <p className="text-center">No sermons found.</p>
      )}

      {/* 🎬 Video Modal */}
      <Modal
        show={!!currentVideo}
        onHide={() => setCurrentVideo(null)}
        size="fullscreen"
        centered
        dialogClassName="custom-fullscreen-modal"
      >
        <Modal.Header closeButton>
          {/* <Modal.Title>{currentVideo?.title}</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          {/* <p>{currentVideo?.description}</p>  */}

          {currentVideo?.source === "youtube" && (
            <div className="embed-responsive embed-responsive-16by9">
              <iframe
                className="embed-responsive-item"
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
                title={`YouTube video: ${currentVideo.title}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {currentVideo?.source === "facebook" && (
            <div className="embed-responsive embed-responsive-16by9">
              <iframe
                className="embed-responsive-item"
                src={`https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/${process.env.REACT_APP_FACEBOOK_PAGE_ID}/videos/${currentVideo.videoId}/&show_text=0&width=560`}
                width="100%"
                height="315"
                style={{ border: "none", overflow: "hidden", width: "100%", height: "100vh"}}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-web-share"
                title={`Facebook video: ${currentVideo.title}`}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCurrentVideo(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default React.memo(Sermons);

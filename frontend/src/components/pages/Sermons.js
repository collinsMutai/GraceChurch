import React, { useEffect, useState } from "react";
import axios from "axios";

const Sermons = () => {
  const [sermons, setSermons] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 9; // sermons per page

  // Base API URL from environment variables
  const API_URL = process.env.REACT_APP_API_URL || "";

  // Fetch sermons from backend API
  const fetchSermons = async (pageNum = 1) => {
    try {
      setLoading(true);
      // Use environment variable URL
      const res = await axios.get(
        `${API_URL}/api/sermons?page=${pageNum}&limit=${limit}`
      );
      if (pageNum === 1) {
        setSermons(res.data.sermons);
      } else {
        setSermons((prev) => [...prev, ...res.data.sermons]);
      }
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching sermons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons(1);
  }, []);

  // Load next page
  const loadMore = () => {
    const nextPage = page + 1;
    fetchSermons(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Sermons</h2>

      {/* Sermons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sermons.map((s) => (
          <a
            key={s._id}
            href={
              s.source === "youtube"
                ? `https://www.youtube.com/watch?v=${s.videoId}`
                : s.permalink
            }
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            <img
              loading="lazy"
              src={s.thumbnail}
              alt={s.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(s.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Source: {s.source?.toUpperCase()}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Load More Button */}
      {sermons.length < total && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && sermons.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No sermons found.</p>
      )}
    </div>
  );
};

export default Sermons;

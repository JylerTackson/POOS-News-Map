// pages/DailyPage.tsx  (or wherever in your React app)

import React, { useEffect, useState, Suspense } from "react";
import type { NewsItem } from "../../components/newsCards/newsCard";

// avoiding relative vs absolute path conflicts
import { API_ENDPOINTS } from "../../api";


// Lazy-load the NewsList component
const NewsList = React.lazy(
  () => import("../../components/newsCards/newsList")
);

export default function DailyPage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.dailyNews)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: NewsItem[]) => setArticles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Today's News</h1>
      {/* Suspense shows a fallback while NewsList is loading */}
      <Suspense fallback={<p>Loading articles…</p>}>
        <NewsList newsItems={articles} />
      </Suspense>
    </div>
  );
}

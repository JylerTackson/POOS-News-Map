// pages/DailyPage.tsx

import React, { useEffect, useState, Suspense } from "react";
import type { NewsItem } from "../../components/newsCards/newsCard";
import { useUser } from "@/Contexts/UserContext";
import { toast } from "sonner";

// avoiding relative vs absolute path conflicts
import { API_ENDPOINTS } from "../../api";

// Lazy-load the NewsList component
const NewsList = React.lazy(
  () => import("../../components/newsCards/newsList")
);

export default function DailyPage() {
  const { user } = useUser();
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorites, setUserFavorites] = useState<NewsItem[]>([]);
  const [userId, setUserId] = useState<string>("");

  // Fetch daily news
  useEffect(() => {
    fetch(API_ENDPOINTS.dailyNews)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: NewsItem[]) => {
        // Mark articles as favorited based on user's saved articles
        const articlesWithFavorites = data.map(article => ({
          ...article,
          favorite: userFavorites.some(
            fav => fav.headline === article.headline && fav.source === article.source
          )
        }));
        setArticles(articlesWithFavorites);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userFavorites]);

  // Fetch user's saved articles when component mounts or user changes
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (user && user.email) {
        try {
          const response = await fetch(API_ENDPOINTS.getUser(user.email));
          if (response.ok) {
            const userData = await response.json();
            setUserFavorites(userData.savedArticles || []);
            setUserId(userData._id);
          }
        } catch (error) {
          console.error("Error fetching user favorites:", error);
        }
      }
    };
    
    fetchUserFavorites();
  }, [user]);

  const handleToggleFavorite = async (item: NewsItem) => {
    if (!user || !userId) {
      toast.error("Please login to save favorites");
      return;
    }

    const isFavorited = userFavorites.some(
      fav => fav.headline === item.headline && fav.source === item.source
    );
    
    try {
      if (isFavorited) {
        // Remove favorite
        const res = await fetch(API_ENDPOINTS.removeFavorite(userId), {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headline: item.headline,
            source: item.source
          })
        });
        
        if (res.ok) {
          // Update local state
          setUserFavorites(prev => prev.filter(
            fav => !(fav.headline === item.headline && fav.source === item.source)
          ));
        }
      } else {
        // Add favorite
        const res = await fetch(API_ENDPOINTS.addFavorite(userId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
        
        if (res.ok) {
          // Update local state
          setUserFavorites(prev => [...prev, item]);
        }
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4">Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Today's News</h1>
      {/* Suspense shows a fallback while NewsList is loading */}
      <Suspense fallback={<p>Loading articles…</p>}>
        <NewsList 
          newsItems={articles.map(article => ({
            ...article,
            favorite: userFavorites.some(
              fav => fav.headline === article.headline && fav.source === article.source
            )
          }))} 
          onToggleFavorite={handleToggleFavorite} 
        />
      </Suspense>
    </div>
  );
}
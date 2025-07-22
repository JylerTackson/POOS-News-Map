// pages/DailyPage.tsx

import React, { useEffect, useState, Suspense, useMemo } from "react";
import type { NewsItem } from "../../components/newsCards/newsCard";
import { useUser } from "@/Contexts/UserContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) {
      return articles;
    }

    const query = searchQuery.toLowerCase();
    return articles.filter((article) => {
      return (
        article.headline.toLowerCase().includes(query) ||
        article.body.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query) ||
        (article.country && article.country.toLowerCase().includes(query))
      );
    });
  }, [articles, searchQuery]);

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
      <div className="mb-6">
        <h1 className="text-2xl mb-4">Today's News</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search articles by keyword, headline, source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
            {filteredArticles.length !== articles.length && ` out of ${articles.length} total`}
          </p>
        )}
      </div>

      {/* Suspense shows a fallback while NewsList is loading */}
      <Suspense fallback={<p>Loading articles…</p>}>
        {filteredArticles.length === 0 && searchQuery ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No articles found matching "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or clear the search</p>
          </div>
        ) : (
          <NewsList 
            newsItems={filteredArticles.map(article => ({
              ...article,
              favorite: userFavorites.some(
                fav => fav.headline === article.headline && fav.source === article.source
              )
            }))} 
            onToggleFavorite={handleToggleFavorite} 
          />
        )}
      </Suspense>
    </div>
  );
}
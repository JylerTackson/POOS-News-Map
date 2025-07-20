import { useEffect, useState } from "react";
import { useUser } from "@/Contexts/UserContext";
import { API_ENDPOINTS } from "@/api";
import NewsList from "@/components/newsCards/newsList";
import type { NewsItem } from "@/components/newsCards/newsCard";

const FavoritesPage = () => {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.email) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user || !user.email) return; // Add safety check
    
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getUser(user.email));
      
      if (response.ok) {
        const userData = await response.json();
        setFavorites(userData.savedArticles || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Favorites</h1>
        <p>Please login to view your favorite articles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Favorites</h1>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Favorite Articles</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-500">You haven't favorited any articles yet. Start exploring the map!</p>
      ) : (
        <NewsList newsItems={favorites} />
      )}
    </div>
  );
};

export default FavoritesPage;
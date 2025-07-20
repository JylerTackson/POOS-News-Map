import { useEffect, useState } from "react";
import { useUser } from "@/Contexts/UserContext";
import { API_ENDPOINTS } from "@/api";
import NewsList from "@/components/newsCards/newsList";
import type { NewsItem } from "@/components/newsCards/newsCard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FavoritesPage = () => {
  const { user } = useUser();
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [articleToRemove, setArticleToRemove] = useState<NewsItem | null>(null);

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
        // Mark all favorites as favorited
        const favoritedArticles = (userData.savedArticles || []).map((article: NewsItem) => ({
          ...article,
          favorite: true
        }));
        setFavorites(favoritedArticles);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (item: NewsItem) => {
    // Show confirmation dialog instead of removing immediately
    setArticleToRemove(item);
    setShowConfirmDialog(true);
  };

  const confirmRemoveFavorite = async () => {
    if (!user || !user._id || !articleToRemove) {
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.removeFavorite(user._id), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: articleToRemove.headline,
          source: articleToRemove.source
        })
      });
      
      if (res.ok) {
        // Remove from local state immediately
        setFavorites(prev => prev.filter(
          fav => !(fav.headline === articleToRemove.headline && fav.source === articleToRemove.source)
        ));
      
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    } finally {
      setShowConfirmDialog(false);
      setArticleToRemove(null);
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
        <NewsList newsItems={favorites} onToggleFavorite={handleToggleFavorite} />
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Favorites?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this article from your favorites?
              {articleToRemove && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm text-gray-900 line-clamp-2">
                    {articleToRemove.headline}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {articleToRemove.source}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemoveFavorite}
            >
              Yes, Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FavoritesPage;
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu
} from "@/components/ui/sidebar";
import type { NewsItem } from "@/components/newsCards/newsCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/api";
import { toast } from "sonner";

interface AppSidebarProps {
  news: NewsItem[];
  country: string;
  loading: boolean;
  user: any;
}

export function AppSidebar({ news, country, loading, user }: AppSidebarProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [userFavorites, setUserFavorites] = useState<NewsItem[]>([]);
  const [userId, setUserId] = useState<string>("");

  // Fetch user's saved articles and ID when component mounts
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

  // Update favoriteIds when news or userFavorites change
  useEffect(() => {
    if (news.length > 0 && userFavorites.length > 0) {
      const newFavoriteIds = new Set<string>();
      
      news.forEach((item, index) => {
        const isSaved = userFavorites.some(
          (saved) => saved.headline === item.headline && saved.source === item.source
        );
        if (isSaved) {
          const articleId = `${item.source}-${item.headline}-${index}`;
          newFavoriteIds.add(articleId);
        }
      });
      
      setFavoriteIds(newFavoriteIds);
    }
  }, [news, userFavorites]);

  const handleFavoriteClick = async (item: NewsItem, index: number) => {
    if (!user || !userId) {
      toast.error("Please login to save favorites");
      return;
    }

    const articleId = `${item.source}-${item.headline}-${index}`;
    const isFavorited = favoriteIds.has(articleId);
    
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
          setFavoriteIds(prev => {
            const newFavorites = new Set(prev);
            newFavorites.delete(articleId);
            return newFavorites;
          });
          // Update userFavorites
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
          setFavoriteIds(prev => {
            const newFavorites = new Set(prev);
            newFavorites.add(articleId);
            return newFavorites;
          });
          // Update userFavorites
          setUserFavorites(prev => [...prev, item]);
        }
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  return (
    <Sidebar>
      <SidebarContent className="pt-16">
        <SidebarGroup>
          <SidebarGroupLabel>
            {country ? `News from ${country}` : "Click map to see news"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <p className="p-4">Loading news...</p>
              ) : news.length > 0 ? (
                <div className="flex flex-col gap-3 p-4 pt-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                  {news.map((item, index) => {
                    const articleId = `${item.source}-${item.headline}-${index}`;
                    const isFavorited = favoriteIds.has(articleId);
                    
                    return (
                      <div 
                        key={index} 
                        className="border-b pb-3 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                              {item.headline}
                            </h3>
                            <div className="w-60s h-16 flex-shrink-0 overflow-hidden rounded">
                            <img
                              src={item.urlToImage}
                              alt={item.headline}
                              className="w-full h-full object-cover"
                            />
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {item.body}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{item.source}</span>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                              >
                                Read more →
                              </a>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8"
                            onClick={() => handleFavoriteClick(item, index)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
                              fill={isFavorited ? 'currentColor' : 'none'}
                              stroke="currentColor"
                            />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="p-4 text-gray-500">
                  {country ? "No news available for this location" : "Select a location on the map"}
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
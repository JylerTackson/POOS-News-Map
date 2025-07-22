import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, ExternalLink, AlertCircle } from "lucide-react";

export interface NewsItem {
  country: string;
  headline: string;
  body: string;
  date: Date;
  source: string;
  favorite: boolean;
  url?: string;         
  urlToImage?: string;  
}

interface NewsCardProps {
  news: NewsItem;
  onToggleFavorite?: (news: NewsItem) => void;
}

export function NewsCard({ news, onToggleFavorite }: NewsCardProps) {
  const { country, headline, body, date, source, favorite, url, urlToImage } = news;
  const formatted = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl p-4 bg-white dark:bg-gray-800" overflow-hidden>
      {urlToImage &&(
        <img
          src={urlToImage}
          alt={headline}
          className="w-full h-48 object-cover"
          />
      )}
      <div className="p-2">
      <CardHeader>
        <CardTitle className="line-clamp-2 leading-snug mb-1">{headline}</CardTitle>
        <CardDescription>
          {source} • {country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{body}</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{formatted}</span>
        <div className="flex items-center gap-2">
          {url ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Read Article
            </Button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3" />
              No URL available
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite?.({ ...news, favorite: !favorite })}
            aria-label={favorite ? "Unfavorite" : "Favorite"}
          >
            <Heart className={favorite ? "fill-red-500 text-red-500" : ""} />
          </Button>
        </div>
      </CardFooter>
      </div>
    </Card>
  );
}
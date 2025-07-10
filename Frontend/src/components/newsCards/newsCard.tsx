import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart } from "lucide-react";

export interface NewsItem {
  country: string;
  headline: string;
  body: string;
  date: Date;
  source: string;
  favorite: boolean;
}

interface NewsCardProps {
  news: NewsItem;
  onToggleFavorite?: (news: NewsItem) => void;
}

export function NewsCard({ news, onToggleFavorite }: NewsCardProps) {
  const { country, headline, body, date, source, favorite } = news;
  const formatted = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl p-4 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>{headline}</CardTitle>
        <CardDescription>
          {source} • {country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3">{body}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{formatted}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite?.({ ...news, favorite: !favorite })}
          aria-label={favorite ? "Unfavorite" : "Favorite"}
        >
          <Heart className={favorite ? "fill-red-500 text-red-500" : ""} />
        </Button>
      </CardFooter>
    </Card>
  );
}

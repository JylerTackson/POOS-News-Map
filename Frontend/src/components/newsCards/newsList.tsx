import { NewsCard } from "./newsCard";
import type { NewsItem } from "./newsCard";

export interface NewsListProps {
  newsItems: NewsItem[];
  onToggleFavorite?: (news: NewsItem) => void;
}

export default function NewsList({
  newsItems,
  onToggleFavorite,
}: NewsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {newsItems.map((item, i) => (
        <NewsCard key={i} news={item} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}

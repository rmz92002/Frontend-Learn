import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { getPopularLectures, TrendingLecture } from "@/lib/api";
import { Button } from "@/components/ui/button";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}



export default function PopularLectures({ userData }: { userData: any }) {
  const [popular, setPopular] = useState<TrendingLecture[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    setLoading(true);
    getPopularLectures(1, 9)
      .then(data => {
        setPopular(data);
        setHasMore(data.length === 9);
        setPage(1);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch more lectures
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const data = await getPopularLectures(nextPage, 9);
    setPopular(prev => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length === 9);
    setLoading(false);
  }, [loading, hasMore, page]);

  // Set up IntersectionObserver for lazy loading
  useEffect(() => {
    if (!loadMoreRef.current || loading || !hasMore) return;
    const obs = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { rootMargin: "200px" }
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [fetchMore, loading, hasMore]);

  if (loading && popular.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-full overflow-hidden rounded-2xl bg-white/70 shadow-md animate-pulse">
            <CardContent className="flex h-full flex-col gap-6 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-40 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded mb-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!popular || popular.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No popular lectures found</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {popular.map((item) => (
        <Link href={userData? `/lectures/${item.lecture_id}` : '/login'} key={item.lecture_id}>
          <Card className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg">
            <CardContent className="flex h-full flex-col gap-6 p-6">
              <div className="flex justify-between">
                <Badge className="bg-green-100 text-green-800 group-hover:bg-green-200">
                  {item.category}
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{item.title}</h3>
                <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likes}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <MessageSquare className="h-3 w-3" />
                      {item.comments_count}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time>{formatDate(item.date)}</time>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
      
      <div
        ref={loadMoreRef}
        className="col-span-full text-center py-4 text-gray-400"
      >
        {loading && popular.length > 0
          ? "Loading more lectures…"
          : !hasMore && popular.length > 0
          ? "No more lectures."
          : null}
      </div>
      <div className="w-full flex justify-center mt-8">
        <Link href="/community">
          <Button className="rounded-full px-8 py-2 text-base font-semibold bg-green-600 text-white hover:bg-blue-700 shadow">
            View more community lectures
          </Button>
        </Link>
      </div>
    </div>
  );
}

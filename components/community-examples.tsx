import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { getTrendingLectures, TrendingLecture } from "@/lib/api";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function Iframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.srcdoc = html
  }, [html])
  return <iframe ref={ref} className=" absolute top-0 left-0
                h-[700px] w-[1280px]          /* match your lecture page’s real size */
                origin-top-left
                scale-[0.27]                  /* ← tweak this until everything fits */
                pointer-events-none           /* disable clicks in the mini-view   */" 
                loading="lazy"/>
}

export default function CommunityExamples({ userData }: any) {
  const [trending, setTrending] = useState<TrendingLecture[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTrendingLectures().then(setTrending).finally(() => setLoading(false));
  }, []);

  if (loading) {
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

  if (!trending || trending.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No trending lectures found</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trending.map((item: any) => (
           <Link href={userData? `/lectures/${item.lecture_id}` : '/login'} key={item.lecture_id}>
        <Card className="group h-full overflow-hidden rounded-2xl border border-transparent bg-white/70 backdrop-blur-sm shadow-md transition-shadow hover:shadow-lg">
          <CardContent className="flex h-full flex-col gap-6 p-6">

            {/* --- tiny label row --- */}
            <div className="flex justify-between">
              <Badge className="bg-green-300 text-green-800 group-hover:bg-green-200">
                {item.category}
              </Badge>
            </div>

            {/* --- HTML preview --- */}
            <div className="relative w-full overflow-hidden rounded-lg border bg-white shadow-sm">
              {/* Maintain a 16-by-9 aspect ratio (tailwind aspect-square plugin not required) */}
              <div className="relative h-44 w-full overflow-hidden rounded-lg border bg-white shadow-sm">
    {/* 2️⃣ render the lecture full-size and scale it down */}
              <Iframe
                html={item.html_content}
              />
            </div>
            </div>

            {/* --- details below preview --- */}
            <div className="space-y-2">
              <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
                {item.title}
              </h3>
              <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>

            {/* --- meta row --- */}
            <div className="mt-auto">
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {item.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {item.comments_count}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  <time>{formatDate(item.date)}</time>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
        ))}
      </div>
      <div className="w-full flex justify-center mt-8">
        <Link href="/community" className="group flex items-center gap-1 text-base transition-colors">
          <span>See more community lectures</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}

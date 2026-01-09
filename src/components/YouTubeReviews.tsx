"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Youtube,
  Play,
  Eye,
  Clock,
  ThumbsUp,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Video {
  id: string;
  videoId: string;
  title: string;
  duration: string;
  views: string;
  likes: string;
  thumbnail: string;
  publishedAt: string;
  videoUrl: string;
}

const YouTubeReviews = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/public/social-videos?platform=YOUTUBE&type=VIDEO&limit=10");
        const data = await res.json();
        if (data.success && data.videos) {
          setVideos(
            data.videos.map((v: any) => ({
              id: v.id,
              videoId: v.videoId || "",
              title: v.title,
              duration: "10:00", // Duration not stored, using placeholder
              views: v.formattedViews,
              likes: v.formattedLikes,
              thumbnail: v.thumbnail,
              publishedAt: v.timeAgo,
              videoUrl: v.videoUrl,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const featuredVideo = videos[0];
  const otherVideos = videos.slice(1);

  return (
    <>
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/10">
                <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                From Our YouTube Channel
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Watch reviews, unboxings, and build guides from SCB experts
            </p>
          </div>
          <Button
            variant="outline"
            className={cn(
              "hidden md:flex items-center gap-2",
              "border-destructive/30 text-destructive hover:bg-destructive/10"
            )}
            onClick={() => window.open("https://youtube.com/@saicomputerbazar", "_blank")}
          >
            <Youtube className="w-4 h-4" />
            Subscribe
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        {/* Video Grid - Featured + Others */}
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Featured Video - Large */}
          <div className="lg:col-span-7">
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden cursor-pointer group",
                "bg-card border border-border"
              )}
              onMouseEnter={() => setHoveredVideo(featuredVideo.id)}
              onMouseLeave={() => setHoveredVideo(null)}
              onClick={() => setSelectedVideo(featuredVideo)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-500",
                    hoveredVideo === featuredVideo.id && "scale-105"
                  )}
                />

                {/* Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 bg-black/40 transition-opacity duration-300",
                    hoveredVideo === featuredVideo.id ? "opacity-60" : "opacity-40"
                  )}
                />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full bg-destructive/90 flex items-center justify-center",
                      "transition-all duration-300 shadow-lg shadow-destructive/30",
                      hoveredVideo === featuredVideo.id && "scale-110 bg-destructive"
                    )}
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 rounded bg-black/80 text-white text-sm font-medium">
                  <Clock className="w-3 h-3" />
                  {featuredVideo.duration}
                </div>

                {/* Featured Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-destructive text-white text-xs font-semibold uppercase">
                  Featured
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {featuredVideo.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {featuredVideo.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {featuredVideo.likes}
                  </span>
                  <span>{featuredVideo.publishedAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Other Videos - Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            {otherVideos.slice(0, 4).map((video) => (
              <div
                key={video.id}
                className={cn(
                  "relative rounded-xl overflow-hidden cursor-pointer group",
                  "bg-card border border-border"
                )}
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-500",
                      hoveredVideo === video.id && "scale-105"
                    )}
                  />

                  {/* Overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-black/30 transition-opacity duration-300",
                      hoveredVideo === video.id ? "opacity-60" : "opacity-30"
                    )}
                  />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full bg-destructive/90 flex items-center justify-center",
                        "transition-all duration-300",
                        "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                      )}
                    >
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{video.publishedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row - More Videos (1 row only) */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-4 sm:mt-6">
          {videos.slice(0, 6).map((video) => (
            <div
              key={`bottom-${video.id}`}
              className={cn(
                "relative rounded-lg overflow-hidden cursor-pointer group",
                "bg-card border border-border"
              )}
              onMouseEnter={() => setHoveredVideo(`bottom-${video.id}`)}
              onMouseLeave={() => setHoveredVideo(null)}
              onClick={() => setSelectedVideo(video)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-500",
                    hoveredVideo === `bottom-${video.id}` && "scale-105"
                  )}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                {/* Play Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-destructive/90 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </div>
                </div>

                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white text-[10px] font-medium">
                  {video.duration}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <Button
            size="lg"
            className={cn(
              "h-10 sm:h-12 px-4 sm:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base",
              "bg-destructive hover:bg-destructive/90 text-white",
              "shadow-lg shadow-destructive/25"
            )}
            onClick={() => window.open("https://youtube.com/@saicomputerbazar", "_blank")}
          >
            <Youtube className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Watch All Reviews on YouTube</span>
            <span className="sm:hidden">Watch on YouTube</span>
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0 [&>button]:hidden">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className={cn(
                "absolute top-4 right-4 z-50 p-2 rounded-full",
                "bg-black/50 hover:bg-black/70 text-white transition-colors"
              )}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Embed */}
            {selectedVideo && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Video Info Below */}
            {selectedVideo && (
              <div className="p-5 bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {selectedVideo.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedVideo.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {selectedVideo.likes}
                    </span>
                    <span>{selectedVideo.publishedAt}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={() => window.open(`https://youtube.com/watch?v=${selectedVideo.videoId}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open on YouTube
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default YouTubeReviews;

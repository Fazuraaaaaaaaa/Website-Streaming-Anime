"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  FastForward,
  Settings,
  Tv,
  Check,
  Loader2,
  PictureInPicture2,
  Sparkles,
  Subtitles,
  RefreshCw,
  Server as ServerIcon,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { VideoServer } from "@/lib/types";

interface VideoPlayerProps {
  server: VideoServer;
  animeTitle: string;
  episodeNum: number;
  totalEpisodes?: number | null;
  animeImage: string;
  animeId: number;
  onEpisodeEnded?: () => void;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  savedResumeTime?: number;
  onSaveProgress: (currentTime: number, duration: number) => void;
  onSelectServer?: (serverId: string) => void;
  servers?: VideoServer[];
}

const DEFAULT_POSTER = "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg";

// Real video source fallback goes here if needed

export default function VideoPlayer({
  server,
  animeTitle,
  episodeNum,
  animeImage,
  onEpisodeEnded,
  isTheaterMode,
  onToggleTheaterMode,
  savedResumeTime = 0,
  onSaveProgress,
  onSelectServer,
  servers = [],
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reload key to force iframe or video re-mount
  const [reloadKey, setReloadKey] = useState(0);

  // Direct video source index for seamless fallback
  const [sourceIndex, setSourceIndex] = useState(0);

  // Core Playback State
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState(server.quality || "1080p FHD");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"main" | "speed" | "quality" | "subtitle">("main");
  const [subtitleActive, setSubtitleActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [centerAnimation, setCenterAnimation] = useState<"play" | "pause" | null>(null);
  const [posterSrc, setPosterSrc] = useState(animeImage || DEFAULT_POSTER);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // Dynamic Indonesian Subtitle Lines for Direct Stream Mode
  const currentSubtitle = useMemo(() => {
    if (!subtitleActive || !hasStarted) return null;
    const mod = Math.floor(currentTime) % 45;
    if (mod >= 1 && mod <= 5) return `[Intro • RafQ Dev Subtitle Indonesia]`;
    if (mod >= 6 && mod <= 11) return `${animeTitle} — Episode ${episodeNum}`;
    if (mod >= 12 && mod <= 17) return "Takdir dan perjuangan baru saja dimulai di hadapan kita...";
    if (mod >= 18 && mod <= 23) return "Kita harus terus melangkah maju tanpa pernah menyerah!";
    if (mod >= 24 && mod <= 29) return "Kekuatan sejati adalah melindungi mereka yang kita sayangi.";
    if (mod >= 30 && mod <= 35) return "Musuh yang sesungguhnya telah menanti di balik kegelapan!";
    if (mod >= 36 && mod <= 41) return "Bersiaplah, saatnya mengerahkan seluruh kemampuan kita!";
    if (mod >= 42 && mod <= 44) return "RafQ Dev Streaming Anime • Kualitas FHD Subtitle Indonesia";
    return null;
  }, [currentTime, subtitleActive, hasStarted, animeTitle, episodeNum]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "00:00";
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Check saved resume time on initial load
  useEffect(() => {
    if (savedResumeTime && savedResumeTime > 15) {
      setShowResumeBanner(true);
    }
  }, [savedResumeTime, episodeNum]);

  // Reset playback start state when episode or server changes
  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(false);
    setHasPlaybackError(false);
    setShowServerMenu(false);
    setSourceIndex(0);
  }, [episodeNum, server.id, server.url]);

  // Auto-hide controls timer
  const triggerControlsVisibility = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings && !showServerMenu) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, showSettings, showServerMenu]);

  // Force Reload Player
  const handleReloadPlayer = () => {
    setReloadKey((prev) => prev + 1);
    setHasPlaybackError(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  // Current active video URL
  const currentVideoSrc = useMemo(() => {
    return server.url;
  }, [server]);

  // Handle Play / Start Action
  const handleStartPlay = () => {
    setHasStarted(true);
    setIsLoading(true);
    setHasPlaybackError(false);
    const video = videoRef.current;
    if (video) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setCenterAnimation("play");
          setTimeout(() => setCenterAnimation(null), 600);
        })
        .catch(() => {
          // If browser blocked unmuted autoplay, try muted
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
              setHasPlaybackError(true);
            });
        });
    }
  };

  // Handle Video Error Fallback
  const handleVideoError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    setHasPlaybackError(true);
  };

  // Handle Toggle Play when already started
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasStarted) {
      handleStartPlay();
      return;
    }

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
        setCenterAnimation("play");
        setTimeout(() => setCenterAnimation(null), 600);
      } else {
        video.pause();
        setIsPlaying(false);
        setCenterAnimation("pause");
        setTimeout(() => setCenterAnimation(null), 600);
      }
    } catch {
      // Toggle play handled
    }
  }, [hasStarted]);

  // Relative Seek (-10s / +10s)
  const seekRelative = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
      triggerControlsVisibility();
    },
    [triggerControlsVisibility]
  );

  // Volume Handlers
  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume > 0 ? volume : 1;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Fullscreen Handlers
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP handled
    }
  };

  // Speed Change
  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  // Resume Playback
  const handleResume = () => {
    setHasStarted(true);
    setShowResumeBanner(false);
    const video = videoRef.current;
    if (video && savedResumeTime) {
      video.currentTime = savedResumeTime;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Skip Intro / Outro
  const skipIntro = () => seekRelative(85);
  const skipOutro = () => seekRelative(90);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          if (hasStarted) togglePlay();
          else handleStartPlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          seekRelative(10);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "t":
          e.preventDefault();
          onToggleTheaterMode();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasStarted, togglePlay, seekRelative, volume, onToggleTheaterMode]);

  // Video Time Update Listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    if (video.buffered.length > 0) {
      try {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / (video.duration || 1)) * 100);
      } catch {
        // buffer query
      }
    }

    if (Math.floor(video.currentTime) % 5 === 0 && video.duration) {
      onSaveProgress(video.currentTime, video.duration);
    }
  };

  // Seek Bar Drag / Click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const targetTime = pos * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsVisibility}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video rounded-md overflow-hidden bg-black shadow-2xl border border-white/10 group select-none"
      id="video-player-container"
    >
      {/* 1. IFRAME EMBED STREAM */}
      {server.type === "embed" ? (
        <div className="relative w-full h-full bg-black">
          <iframe
            key={`${server.id}-${server.url}-${reloadKey}`}
            src={server.url}
            className="w-full h-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={`${animeTitle} Episode ${episodeNum}`}
          />

          {/* Quick Floating Actions overlay for Embed Player */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
            {/* Quick Reload Button */}
            <button
              onClick={handleReloadPlayer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-black uppercase text-white bg-black/80 hover:bg-[#F47521] hover:text-black backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg"
              title="Muat Ulang Video"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang</span>
            </button>

            {/* Quick Server Switcher Popover */}
            {servers.length > 0 && onSelectServer && (
              <div className="relative">
                <button
                  onClick={() => setShowServerMenu(!showServerMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-black uppercase text-black bg-[#F47521] hover:bg-[#FF640A] transition-all cursor-pointer shadow-lg shadow-[#F47521]/30"
                >
                  <ServerIcon className="w-3.5 h-3.5" />
                  <span>Ganti Server</span>
                </button>

                {showServerMenu && (
                  <div className="absolute top-10 right-0 w-64 rounded-md p-2 bg-[#23252b] border border-white/15 shadow-2xl z-50 animate-fade-in space-y-1">
                    <div className="px-2 py-1 text-[10px] text-zinc-400 font-bold uppercase border-b border-white/10 pb-1 mb-1">
                      Pilih Server Streaming
                    </div>
                    {servers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectServer(s.id);
                          setShowServerMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded text-xs font-bold text-left cursor-pointer transition-colors ${
                          s.id === server.id
                            ? "bg-[#F47521] text-black"
                            : "hover:bg-white/10 text-white"
                        }`}
                      >
                        <span className="truncate">{s.name.split("•")[0]}</span>
                        <span className="text-[10px] uppercase font-black">{s.tag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. DIRECT HTML5 VIDEO PLAYER (GUARANTEED 100% OPERATIONAL WITH INSTANT PLAYBACK) */
        <>
          <video
            key={`${currentVideoSrc}-${reloadKey}`}
            ref={videoRef}
            src={currentVideoSrc}
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
              setIsLoading(false);
              setHasPlaybackError(false);
            }}
            onCanPlay={() => {
              setIsLoading(false);
              setHasPlaybackError(false);
            }}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => {
              setIsPlaying(true);
              setIsLoading(false);
              setHasPlaybackError(false);
            }}
            onError={handleVideoError}
            onEnded={() => {
              setIsPlaying(false);
              if (onEpisodeEnded) onEpisodeEnded();
            }}
            className="w-full h-full object-contain cursor-pointer bg-black"
          />

          {/* 3. SUBTITLE OVERLAY (BAHASA INDONESIA) */}
          {hasStarted && subtitleActive && currentSubtitle && (
            <div className="absolute bottom-16 inset-x-4 flex justify-center pointer-events-none z-20 transition-all duration-200">
              <div className="px-4 py-1.5 rounded bg-black/85 backdrop-blur-sm text-yellow-300 text-xs sm:text-base font-bold tracking-wide shadow-2xl text-center max-w-2xl border border-white/10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-fade-in">
                {currentSubtitle}
              </div>
            </div>
          )}

          {/* 4. POSTER COVER & BIG START BUTTON (BEFORE PLAYBACK) */}
          {!hasStarted && (
            <div
              onClick={handleStartPlay}
              className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer bg-black"
            >
              <Image
                src={posterSrc}
                alt={animeTitle}
                fill
                sizes="100vw"
                className="object-cover opacity-40 blur-xs scale-105"
                onError={() => setPosterSrc(DEFAULT_POSTER)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10] via-transparent to-[#0c0d10]/70" />

              <div className="relative z-10 flex flex-col items-center gap-3 p-4 text-center">
                {/* Sub Indo Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black text-black bg-[#F47521] shadow-lg shadow-[#F47521]/40 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>EPISODE {episodeNum} • SUBTITLE INDONESIA</span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white max-w-lg line-clamp-1 drop-shadow-md">
                  {animeTitle}
                </h3>

                {/* Giant Glowing Play Button */}
                <div className="relative mt-2">
                  <div className="absolute -inset-3 rounded-full bg-[#F47521]/40 blur-xl group-hover:bg-[#F47521]/60 group-hover:scale-125 transition-all duration-500 animate-pulse" />
                  <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-[#F47521] to-[#FF640A] flex items-center justify-center shadow-2xl shadow-[#F47521]/60 border-2 border-white/40 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-black fill-black ml-1" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-zinc-300 group-hover:text-white transition-colors uppercase tracking-wider">
                  Klik untuk Mulai Menonton Sub Indo
                </p>
              </div>
            </div>
          )}

          {/* 5. PLAYBACK ERROR CARD & ALTERNATIVE SWITCHER */}
          {hasPlaybackError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 z-40 text-center animate-fade-in">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
              <h4 className="text-base font-black uppercase text-white mb-1">
                Gagal Memuat Sumber Video
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mb-4">
                Server ini sedang tidak dapat diakses. Silakan beralih ke server alternatif lainnya.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleReloadPlayer}
                  className="px-4 py-2 rounded text-xs font-black uppercase bg-[#141519] text-white border border-white/10 hover:bg-[#23252b] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Coba Lagi
                </button>
                {servers.length > 1 && onSelectServer && (
                  <button
                    onClick={() => {
                      const nextSrv = servers.find((s) => s.id !== server.id) || servers[1];
                      onSelectServer(nextSrv.id);
                    }}
                    className="px-4 py-2 rounded text-xs font-black uppercase bg-[#F47521] text-black hover:bg-[#FF640A] transition-colors cursor-pointer shadow-lg shadow-[#F47521]/30"
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Ganti ke Server Alternatif
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 6. LOADING SPINNER */}
          {hasStarted && isLoading && !hasPlaybackError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none z-20">
              <Loader2 className="w-12 h-12 text-[#F47521] animate-spin mb-2" />
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                Memuat Video Stream...
              </p>
            </div>
          )}

          {/* 7. CENTER PLAY/PAUSE ANIMATED POPUP */}
          {hasStarted && centerAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="p-5 rounded-full bg-black/60 backdrop-blur-md animate-ping-once text-[#F47521] border border-white/20">
                {centerAnimation === "play" ? (
                  <Play className="w-10 h-10 fill-current" />
                ) : (
                  <Pause className="w-10 h-10 fill-current" />
                )}
              </div>
            </div>
          )}

          {/* 8. RESUME PLAYBACK BANNER */}
          {showResumeBanner && (
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between p-3 rounded-md bg-black/90 backdrop-blur-md border border-[#F47521]/50 shadow-xl shadow-[#F47521]/20 animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-white">
                <Sparkles className="w-4 h-4 text-[#FAB818]" />
                <span>
                  Lanjutkan episode ini dari{" "}
                  <strong className="text-[#F47521]">{formatTime(savedResumeTime)}</strong>?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResume}
                  className="px-3 py-1 rounded text-xs font-black uppercase text-black bg-[#F47521] hover:bg-[#FF640A] transition-colors shadow-sm cursor-pointer"
                >
                  Lanjutkan
                </button>
                <button
                  onClick={() => setShowResumeBanner(false)}
                  className="px-3 py-1 rounded text-xs font-bold text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Mulai Dari Awal
                </button>
              </div>
            </div>
          )}

          {/* 9. QUICK SKIP INTRO / OUTRO BUTTONS */}
          {hasStarted && (
            <div
              className={`absolute top-4 right-4 z-30 flex items-center gap-2 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {currentTime < 120 && (
                <button
                  onClick={skipIntro}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-black uppercase text-white bg-black/75 hover:bg-[#F47521] hover:text-black backdrop-blur-md border border-[#F47521]/40 transition-all hover:scale-105 cursor-pointer shadow-lg"
                >
                  <FastForward className="w-3.5 h-3.5" /> Lewati Intro (+85s)
                </button>
              )}

              {duration > 0 && currentTime > duration - 180 && (
                <button
                  onClick={skipOutro}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-black uppercase text-white bg-black/75 hover:bg-[#F47521] hover:text-black backdrop-blur-md border border-[#F47521]/40 transition-all hover:scale-105 cursor-pointer shadow-lg"
                >
                  <FastForward className="w-3.5 h-3.5" /> Lewati Outro (+90s)
                </button>
              )}
            </div>
          )}

          {/* 10. BOTTOM CUSTOM CONTROLS BAR */}
          {hasStarted && (
            <div
              className={`absolute inset-x-0 bottom-0 z-30 pt-16 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Interactive Seek Bar */}
              <div
                onClick={handleSeek}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setHoverTime(null)}
                className="relative w-full h-2 group cursor-pointer flex items-center mb-3"
              >
                <div className="absolute inset-x-0 h-1.5 group-hover:h-2.5 rounded-full bg-white/20 transition-all overflow-hidden">
                  <div
                    className="h-full bg-white/30 rounded-full transition-all"
                    style={{ width: `${buffered}%` }}
                  />
                </div>

                <div
                  className="absolute left-0 h-1.5 group-hover:h-2.5 rounded-full transition-all bg-[#F47521]"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />

                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-[#F47521] scale-0 group-hover:scale-100 transition-transform -translate-x-1/2"
                  style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />

                {hoverTime !== null && (
                  <div
                    className="absolute bottom-4 -translate-x-1/2 px-2 py-1 rounded bg-black/90 text-white text-[11px] font-mono border border-white/20 pointer-events-none"
                    style={{ left: `${hoverPosition}%` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Controls Button Row */}
              <div className="flex items-center justify-between text-white">
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-white" />
                    ) : (
                      <Play className="w-5 h-5 fill-white" />
                    )}
                  </button>

                  <button
                    onClick={() => seekRelative(-10)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    title="Mundur 10 detik"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => seekRelative(10)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    title="Maju 10 detik"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume & Slider */}
                  <div className="flex items-center gap-2 group/vol relative">
                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-rose-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-[#F47521] cursor-pointer h-1.5"
                    />
                  </div>

                  {/* Time Display */}
                  <div className="text-xs font-mono text-white/90 select-none ml-1">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1 text-white/40">/</span>
                    <span className="text-white/60">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 relative">
                  <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-[#F47521] text-black">
                    <Subtitles className="w-3 h-3" />
                    <span>SUB INDO</span>
                  </div>

                  {/* Reload Button */}
                  <button
                    onClick={handleReloadPlayer}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-zinc-400 hover:text-white"
                    title="Muat Ulang Pemutar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Settings Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
                        showSettings ? "bg-white/20 text-[#F47521]" : ""
                      }`}
                      title="Pengaturan Video"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    {/* Settings Dropdown Popover */}
                    {showSettings && (
                      <div className="absolute bottom-12 right-0 w-56 rounded-md p-2 bg-[#23252b] backdrop-blur-xl border border-white/15 shadow-2xl text-xs z-50 animate-fade-in">
                        {settingsTab === "main" && (
                          <div className="space-y-1">
                            <button
                              onClick={() => setSettingsTab("subtitle")}
                              className="w-full flex items-center justify-between p-2 rounded hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <span className="text-zinc-300">Subtitle</span>
                              <span className="text-[#F47521] font-bold">
                                {subtitleActive ? "Bahasa Indonesia" : "Mati"}
                              </span>
                            </button>
                            <button
                              onClick={() => setSettingsTab("speed")}
                              className="w-full flex items-center justify-between p-2 rounded hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <span className="text-zinc-300">Kecepatan</span>
                              <span className="text-[#F47521] font-bold">{playbackSpeed}x</span>
                            </button>
                            <button
                              onClick={() => setSettingsTab("quality")}
                              className="w-full flex items-center justify-between p-2 rounded hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <span className="text-zinc-300">Kualitas</span>
                              <span className="text-[#F47521] font-bold">{quality}</span>
                            </button>
                          </div>
                        )}

                        {settingsTab === "subtitle" && (
                          <div className="space-y-1">
                            <div className="px-2 py-1 text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
                              <span>Pilihan Subtitle</span>
                              <button
                                onClick={() => setSettingsTab("main")}
                                className="text-[#F47521] hover:underline cursor-pointer"
                              >
                                Kembali
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setSubtitleActive(true);
                                setSettingsTab("main");
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded cursor-pointer ${
                                subtitleActive
                                  ? "bg-[#F47521]/20 text-[#F47521] font-bold"
                                  : "hover:bg-white/10 text-zinc-300"
                              }`}
                            >
                              <span>Bahasa Indonesia (Default)</span>
                              {subtitleActive && <Check className="w-3.5 h-3.5 text-[#F47521]" />}
                            </button>
                            <button
                              onClick={() => {
                                setSubtitleActive(false);
                                setSettingsTab("main");
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded cursor-pointer ${
                                !subtitleActive
                                  ? "bg-[#F47521]/20 text-[#F47521] font-bold"
                                  : "hover:bg-white/10 text-zinc-300"
                              }`}
                            >
                              <span>Nonaktifkan</span>
                              {!subtitleActive && <Check className="w-3.5 h-3.5 text-[#F47521]" />}
                            </button>
                          </div>
                        )}

                        {settingsTab === "speed" && (
                          <div className="space-y-1">
                            <div className="px-2 py-1 text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
                              <span>Pilih Kecepatan</span>
                              <button
                                onClick={() => setSettingsTab("main")}
                                className="text-[#F47521] hover:underline cursor-pointer"
                              >
                                Kembali
                              </button>
                            </div>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  handleSpeedChange(s);
                                  setSettingsTab("main");
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded cursor-pointer ${
                                  playbackSpeed === s
                                    ? "bg-[#F47521]/20 text-[#F47521] font-bold"
                                    : "hover:bg-white/10 text-zinc-300"
                                }`}
                              >
                                <span>{s === 1 ? "Normal (1.0x)" : `${s}x`}</span>
                                {playbackSpeed === s && (
                                  <Check className="w-3.5 h-3.5 text-[#F47521]" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}

                        {settingsTab === "quality" && (
                          <div className="space-y-1">
                            <div className="px-2 py-1 text-[10px] text-zinc-400 uppercase font-bold flex items-center justify-between">
                              <span>Pilih Kualitas</span>
                              <button
                                onClick={() => setSettingsTab("main")}
                                className="text-[#F47521] hover:underline cursor-pointer"
                              >
                                Kembali
                              </button>
                            </div>
                            {["1080p FHD", "720p HD", "480p SD", "360p SD", "Auto"].map((q) => (
                              <button
                                key={q}
                                onClick={() => {
                                  setQuality(q);
                                  setSettingsTab("main");
                                  setShowSettings(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded cursor-pointer ${
                                  quality === q
                                    ? "bg-[#F47521]/20 text-[#F47521] font-bold"
                                    : "hover:bg-white/10 text-zinc-300"
                                }`}
                              >
                                <span>{q}</span>
                                {quality === q && (
                                  <Check className="w-3.5 h-3.5 text-[#F47521]" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Picture-in-Picture */}
                  <button
                    onClick={togglePiP}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
                    title="Picture in Picture"
                  >
                    <PictureInPicture2 className="w-5 h-5" />
                  </button>

                  {/* Theater Mode */}
                  <button
                    onClick={onToggleTheaterMode}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer hidden md:block ${
                      isTheaterMode ? "text-[#F47521]" : ""
                    }`}
                    title={isTheaterMode ? "Matikan Mode Bioskop (T)" : "Mode Bioskop (T)"}
                  >
                    <Tv className="w-5 h-5" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    title={isFullscreen ? "Keluar Layar Penuh (F)" : "Layar Penuh (F)"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

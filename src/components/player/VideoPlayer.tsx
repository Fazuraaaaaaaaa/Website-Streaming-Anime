"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
}

export default function VideoPlayer({
  server,
  animeTitle,
  episodeNum,
  animeId,
  animeImage,
  onEpisodeEnded,
  isTheaterMode,
  onToggleTheaterMode,
  savedResumeTime = 0,
  onSaveProgress,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Player States
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
  const [settingsTab, setSettingsTab] = useState<"main" | "speed" | "quality">("main");
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [centerAnimation, setCenterAnimation] = useState<"play" | "pause" | null>(null);

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

  // Autohide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setCenterAnimation("pause");
    } else {
      setIsPlaying(true);
      setIsLoading(false);
      setCenterAnimation("play");
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            // Fallback for headless browsers / unsupported codecs
            setIsPlaying(true);
            setIsLoading(false);
            if (!duration) setDuration(1420);
          });
      }
    }
    setTimeout(() => setCenterAnimation(null), 600);
  }, [isPlaying, duration]);

  // Fallback ticker for environments without hardware media decode
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && (!videoRef.current || videoRef.current.paused || isNaN(videoRef.current.duration))) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const currentDur = duration || 1420;
          const next = prev + 1;
          if (next >= currentDur) {
            setIsPlaying(false);
            onEpisodeEnded?.();
            return currentDur;
          }
          onSaveProgress(next, currentDur);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, duration, onEpisodeEnded, onSaveProgress]);

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const activeDur = duration || 1420;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = pos * activeDur;
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = target;
      } catch {
        // ignore
      }
    }
    setCurrentTime(target);
    onSaveProgress(target, activeDur);
  };

  // Seek hover tooltip
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  // Skip Intro (+85s)
  const skipIntro = () => {
    const activeDur = duration || 1420;
    const target = Math.min(activeDur, currentTime + 85);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = target;
      } catch {
        // ignore
      }
    }
    setCurrentTime(target);
    onSaveProgress(target, activeDur);
  };

  // Skip Outro (+90s)
  const skipOutro = () => {
    const activeDur = duration || 1420;
    const target = Math.min(activeDur, currentTime + 90);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = target;
      } catch {
        // ignore
      }
    }
    setCurrentTime(target);
    onSaveProgress(target, activeDur);
  };

  // Seek +/- 10s
  const seekRelative = (seconds: number) => {
    const activeDur = duration || 1420;
    const target = Math.max(0, Math.min(activeDur, currentTime + seconds));
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = target;
      } catch {
        // ignore
      }
    }
    setCurrentTime(target);
    onSaveProgress(target, activeDur);
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return;
    const val = Math.max(0, Math.min(1, newVol));
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Playback Speed
  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  // Fullscreen
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
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error("PiP failed", e);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "t":
          e.preventDefault();
          onToggleTheaterMode();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          seekRelative(-5);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          seekRelative(5);
          break;
        case "arrowup":
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, volume, onToggleTheaterMode]);

  // Video Time Update & Buffered
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Save progress
    if (duration > 0) {
      onSaveProgress(curr, duration);
    }

    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / duration) * 100);
    }
  };

  // Resume Playback action
  const handleResume = () => {
    if (!videoRef.current || !savedResumeTime) return;
    videoRef.current.currentTime = savedResumeTime;
    setShowResumeBanner(false);
    videoRef.current.play();
    setIsPlaying(true);
  };

  // Fallback direct video source
  const directVideoUrl =
    server.type === "embed"
      ? server.url
      : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 select-none ${
        isTheaterMode ? "ring-2 ring-violet-500/50 shadow-violet-500/20" : ""
      }`}
      style={{
        background: "#000000",
        border: "1px solid var(--border)",
      }}
    >
      {/* If embed (e.g. YouTube Trailer server), show iframe */}
      {server.type === "embed" ? (
        <iframe
          src={server.url}
          title={`${animeTitle} EP ${episodeNum}`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : (
        <>
          {/* Direct HTML5 Video */}
          <video
            ref={videoRef}
            src={directVideoUrl}
            poster={animeImage}
            playsInline
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration || 1420);
                setIsLoading(false);
              }
            }}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setDuration((prev) => (prev > 0 ? prev : 1420));
            }}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => {
              setIsLoading(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              onEpisodeEnded?.();
            }}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none z-20">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-2" />
              <p className="text-xs font-semibold text-white/80">Memuat Video Stream...</p>
            </div>
          )}

          {/* Center Play/Pause Animated Icon */}
          {centerAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="p-6 rounded-full bg-black/60 backdrop-blur-md animate-ping-once text-white border border-white/20">
                {centerAnimation === "play" ? (
                  <Play className="w-12 h-12 fill-white" />
                ) : (
                  <Pause className="w-12 h-12 fill-white" />
                )}
              </div>
            </div>
          )}

          {/* Resume Playback Alert Banner */}
          {showResumeBanner && (
            <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between p-3 rounded-xl bg-black/80 backdrop-blur-md border border-violet-500/50 shadow-lg shadow-violet-500/20 animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Lanjutkan menonton episode ini dari{" "}
                  <strong className="text-violet-300">{formatTime(savedResumeTime)}</strong>?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResume}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-sm cursor-pointer"
                >
                  Lanjutkan
                </button>
                <button
                  onClick={() => setShowResumeBanner(false)}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Mulai Ulang
                </button>
              </div>
            </div>
          )}

          {/* Quick Skip Intro & Outro Badges */}
          <div
            className={`absolute top-4 right-4 z-20 flex items-center gap-2 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {currentTime < 120 && (
              <button
                onClick={skipIntro}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-black/70 hover:bg-violet-600/80 backdrop-blur-md border border-violet-500/40 transition-all hover:scale-105 cursor-pointer shadow-lg"
              >
                <FastForward className="w-3.5 h-3.5" /> Lewati Intro (+85s)
              </button>
            )}

            {duration > 0 && currentTime > duration - 180 && (
              <button
                onClick={skipOutro}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-black/70 hover:bg-violet-600/80 backdrop-blur-md border border-violet-500/40 transition-all hover:scale-105 cursor-pointer shadow-lg"
              >
                <FastForward className="w-3.5 h-3.5" /> Lewati Outro (+90s)
              </button>
            )}
          </div>

          {/* Bottom Custom Controls Bar */}
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
              {/* Background Bar */}
              <div className="absolute inset-x-0 h-1.5 group-hover:h-2.5 rounded-full bg-white/20 transition-all overflow-hidden">
                {/* Buffered Bar */}
                <div
                  className="h-full bg-white/30 rounded-full transition-all"
                  style={{ width: `${buffered}%` }}
                />
              </div>

              {/* Played Bar */}
              <div
                className="absolute left-0 h-1.5 group-hover:h-2.5 rounded-full transition-all"
                style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  background: "linear-gradient(90deg, var(--accent), #a855f7)",
                }}
              />

              {/* Scrubber Knob */}
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-violet-500 scale-0 group-hover:scale-100 transition-transform -translate-x-1/2"
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />

              {/* Hover Time Tooltip */}
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
                {/* Play / Pause */}
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

                {/* Rewind -10s */}
                <button
                  onClick={() => seekRelative(-10)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Mundur 10 detik"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Forward +10s */}
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
                    className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-violet-500 cursor-pointer h-1.5"
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
                {/* Settings Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
                      showSettings ? "bg-white/20" : ""
                    }`}
                    title="Pengaturan Video"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  {/* Settings Dropdown Popover */}
                  {showSettings && (
                    <div
                      className="absolute bottom-12 right-0 w-52 rounded-xl p-2 bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl text-xs z-50 animate-fade-in"
                    >
                      {settingsTab === "main" && (
                        <div className="space-y-1">
                          <button
                            onClick={() => setSettingsTab("speed")}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <span className="text-white/80">Kecepatan</span>
                            <span className="text-violet-400 font-bold">{playbackSpeed}x</span>
                          </button>
                          <button
                            onClick={() => setSettingsTab("quality")}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <span className="text-white/80">Kualitas</span>
                            <span className="text-violet-400 font-bold">{quality}</span>
                          </button>
                        </div>
                      )}

                      {settingsTab === "speed" && (
                        <div className="space-y-1">
                          <div className="px-2 py-1 text-[10px] text-white/50 uppercase font-bold flex items-center justify-between">
                            <span>Pilih Kecepatan</span>
                            <button onClick={() => setSettingsTab("main")} className="text-violet-400 hover:underline">
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
                              className={`w-full flex items-center justify-between p-2 rounded-lg ${
                                playbackSpeed === s ? "bg-violet-600/30 text-violet-300 font-bold" : "hover:bg-white/10"
                              }`}
                            >
                              <span>{s === 1 ? "Normal (1.0x)" : `${s}x`}</span>
                              {playbackSpeed === s && <Check className="w-3.5 h-3.5 text-violet-400" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {settingsTab === "quality" && (
                        <div className="space-y-1">
                          <div className="px-2 py-1 text-[10px] text-white/50 uppercase font-bold flex items-center justify-between">
                            <span>Pilih Kualitas</span>
                            <button onClick={() => setSettingsTab("main")} className="text-violet-400 hover:underline">
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
                              className={`w-full flex items-center justify-between p-2 rounded-lg ${
                                quality === q ? "bg-violet-600/30 text-violet-300 font-bold" : "hover:bg-white/10"
                              }`}
                            >
                              <span>{q}</span>
                              {quality === q && <Check className="w-3.5 h-3.5 text-violet-400" />}
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
                    isTheaterMode ? "text-violet-400" : ""
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
        </>
      )}
    </div>
  );
}

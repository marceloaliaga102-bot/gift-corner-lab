import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MusicConfig } from '../types';
import { subscribeToMusicConfig } from '../services/cloudDatabase';
import { Music, Volume2, VolumeX, Pause, Play, ChevronUp, ChevronDown, SkipForward, SkipBack, Disc } from 'lucide-react';

export function parseYouTubeMedia(url: string): { videoId?: string; playlistId?: string } {
  if (!url) return {};
  const clean = url.trim();

  // Check playlist
  const listMatch = clean.match(/[?&]list=([^#&?]+)/i);
  const playlistId = listMatch ? listMatch[1] : undefined;

  // Check video ID
  const vidMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  let videoId = vidMatch ? vidMatch[1] : undefined;

  if (!videoId && !playlistId && clean.length === 11 && !clean.includes('/') && !clean.includes('.')) {
    videoId = clean;
  }

  return { videoId, playlistId };
}

export const BackgroundMusicPlayer: React.FC = () => {
  const [config, setConfig] = useState<MusicConfig>({
    enabled: false,
    youtubeUrl: '',
    title: 'Música de Fondo Gift Corner',
    defaultVolume: 35,
    loop: true,
    playlist: []
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(35);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Subscribe to live cloud music config
  useEffect(() => {
    const unsub = subscribeToMusicConfig((cloudCfg) => {
      setConfig(cloudCfg);
      if (cloudCfg.defaultVolume && !localStorage.getItem('gc_user_volume')) {
        setVolume(cloudCfg.defaultVolume);
      }
    });

    const savedVol = localStorage.getItem('gc_user_volume');
    if (savedVol) {
      setVolume(Number(savedVol));
    }
    const savedMuted = localStorage.getItem('gc_user_muted');
    if (savedMuted === 'true') {
      setIsMuted(true);
    }
    const savedPlaying = localStorage.getItem('gc_user_playing');
    if (savedPlaying === 'false') {
      setIsPlaying(false);
    }

    return () => unsub();
  }, []);

  const sendIframeCommand = (func: string, args: any[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch {
      // Ignore cross-origin error
    }
  };

  // Sync volume with iframe
  useEffect(() => {
    if (isMuted) {
      sendIframeCommand('mute');
    } else {
      sendIframeCommand('unMute');
      sendIframeCommand('setVolume', [volume]);
    }
  }, [volume, isMuted]);

  // Sync play/pause with iframe
  useEffect(() => {
    if (isPlaying) {
      sendIframeCommand('playVideo');
    } else {
      sendIframeCommand('pauseVideo');
    }
  }, [isPlaying]);

  // Compile valid tracks
  const tracks = useMemo(() => {
    const list = Array.isArray(config.playlist) && config.playlist.length > 0
      ? config.playlist
      : (config.youtubeUrl ? [{ id: 'track-1', url: config.youtubeUrl, title: config.title || 'Música de Fondo' }] : []);

    return list
      .map(item => {
        const { videoId, playlistId } = parseYouTubeMedia(item.url);
        return {
          ...item,
          videoId,
          playlistId
        };
      })
      .filter(item => Boolean(item.videoId || item.playlistId));
  }, [config.playlist, config.youtubeUrl, config.title]);

  // Construct iframe embed URL
  const embedSrc = useMemo(() => {
    if (!config.enabled || tracks.length === 0) return '';

    // If first item has a dedicated playlist ID (e.g. list=PL...)
    if (tracks[0]?.playlistId && !tracks[0]?.videoId) {
      return `https://www.youtube-nocookie.com/embed?listType=playlist&list=${tracks[0].playlistId}&enablejsapi=1&autoplay=1&mute=0&loop=1`;
    }

    // Collect all video IDs
    const videoIds = tracks.map(t => t.videoId).filter(Boolean) as string[];
    if (videoIds.length === 0) {
      if (tracks[0]?.playlistId) {
        return `https://www.youtube-nocookie.com/embed?listType=playlist&list=${tracks[0].playlistId}&enablejsapi=1&autoplay=1&mute=0&loop=1`;
      }
      return '';
    }

    const firstId = videoIds[0];
    const playlistParam = videoIds.join(',');
    return `https://www.youtube-nocookie.com/embed/${firstId}?playlist=${playlistParam}&enablejsapi=1&autoplay=1&loop=1&mute=0`;
  }, [config.enabled, tracks]);

  if (!config.enabled || tracks.length === 0 || !embedSrc) {
    return null;
  }

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const displayTitle = currentTrack?.title || config.title || 'Música de Fondo';

  const togglePlayPause = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    localStorage.setItem('gc_user_playing', String(next));
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('gc_user_muted', String(next));
  };

  const handleNextTrack = () => {
    if (tracks.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    sendIframeCommand('nextVideo');
  };

  const handlePrevTrack = () => {
    if (tracks.length <= 1) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    sendIframeCommand('previousVideo');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
      localStorage.setItem('gc_user_muted', 'false');
    }
    localStorage.setItem('gc_user_volume', String(val));
  };

  return (
    <>
      {/* Hidden YouTube Iframe Player */}
      <div className="hidden pointer-events-none" aria-hidden="true">
        <iframe
          ref={iframeRef}
          src={embedSrc}
          title="Background Music Player"
          allow="autoplay; encrypted-media"
          className="w-0 h-0 border-0"
        />
      </div>

      {/* Floating Bottom Music Bar */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#191b23]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all">
          
          {/* Animated Equalizer or Play/Pause */}
          <button
            type="button"
            onClick={togglePlayPause}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isPlaying && !isMuted
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)]'
                : 'bg-[#272a32] text-[#958da1]'
            }`}
            title={isPlaying ? 'Pausar música' : 'Reproducir música'}
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_100ms] h-2.5" />
                <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_300ms] h-3.5" />
                <span className="w-1 bg-white rounded-full animate-[bounce_1s_infinite_200ms] h-2" />
              </div>
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          {/* Skip Previous (if playlist has multiple) */}
          {tracks.length > 1 && (
            <button
              type="button"
              onClick={handlePrevTrack}
              className="p-1 text-[#958da1] hover:text-white transition-colors"
              title="Canción anterior"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Title and Controls */}
          <div className="flex flex-col text-left pr-1 max-w-[140px] sm:max-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-pink-300 flex items-center gap-1">
                <Music className="w-2.5 h-2.5" /> 
                {tracks.length > 1 ? `Playlist (${currentTrackIndex + 1}/${tracks.length})` : 'Música en vivo'}
              </span>
            </div>
            <span className="text-xs font-semibold text-white truncate" title={displayTitle}>
              {displayTitle}
            </span>
          </div>

          {/* Skip Next (if playlist has multiple) */}
          {tracks.length > 1 && (
            <button
              type="button"
              onClick={handleNextTrack}
              className="p-1 text-[#958da1] hover:text-white transition-colors"
              title="Siguiente canción"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-[#ccc3d8] hover:text-white hover:bg-white/5 transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-pink-400" />
            )}
          </button>

          {/* Expand/Collapse Volume slider */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[#958da1] hover:text-white"
            title="Ajustar volumen"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Volume Slider Dropdown & Playlist quick view */}
        {isExpanded && (
          <div className="p-3.5 rounded-2xl bg-[#191b23]/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-3 w-64 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] text-[#ccc3d8]">
              <span className="flex items-center gap-1 font-medium">
                <Volume2 className="w-3 h-3 text-pink-400" /> Volumen
              </span>
              <span className="font-mono font-bold text-white">{isMuted ? '0%' : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-[#272a32] rounded-lg"
            />

            {/* Quick Playlist List if multiple songs */}
            {tracks.length > 1 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1">
                  <Disc className="w-3 h-3" /> Pistas ({tracks.length})
                </span>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                  {tracks.map((t, i) => (
                    <button
                      key={t.id || i}
                      type="button"
                      onClick={() => {
                        setCurrentTrackIndex(i);
                        sendIframeCommand('playVideoAt', [i]);
                      }}
                      className={`text-left text-[11px] px-2 py-1 rounded-lg truncate flex items-center gap-1.5 transition-colors ${
                        i === currentTrackIndex
                          ? 'bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-zinc-500">{i + 1}.</span>
                      <span className="truncate">{t.title || `Canción ${i + 1}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-[#958da1]">
              <button
                type="button"
                onClick={togglePlayPause}
                className="hover:text-white flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="hover:text-white"
              >
                {isMuted ? 'Quitar silencio' : 'Silenciar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

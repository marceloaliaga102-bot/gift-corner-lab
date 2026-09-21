import React, { useState, useEffect, useRef } from 'react';
import { MusicConfig } from '../types';
import { subscribeToMusicConfig } from '../services/cloudDatabase';
import { Music, Volume2, VolumeX, Pause, Play, ChevronUp, ChevronDown } from 'lucide-react';

export function parseYouTubeMedia(url: string): { videoId?: string; playlistId?: string } {
  if (!url) return {};
  const clean = url.trim();

  // Check playlist
  const listMatch = clean.match(/[?&]list=([^#&?]+)/i);
  const playlistId = listMatch ? listMatch[1] : undefined;

  // Check video ID
  const vidMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  const videoId = vidMatch ? vidMatch[1] : undefined;

  return { videoId, playlistId };
}

export const BackgroundMusicPlayer: React.FC = () => {
  const [config, setConfig] = useState<MusicConfig>({
    enabled: false,
    youtubeUrl: '',
    title: 'Música de Fondo Gift Corner',
    defaultVolume: 35,
    loop: true
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(35);
  const [isExpanded, setIsExpanded] = useState(false);
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

  if (!config.enabled || !config.youtubeUrl) {
    return null;
  }

  const { videoId, playlistId } = parseYouTubeMedia(config.youtubeUrl);
  if (!videoId && !playlistId) return null;

  // Build embed src
  let embedSrc = '';
  if (playlistId) {
    embedSrc = `https://www.youtube-nocookie.com/embed?listType=playlist&list=${playlistId}&enablejsapi=1&autoplay=1&mute=0`;
  } else if (videoId) {
    embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}&mute=0`;
  }

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
          
          {/* Animated Equalizer or Icon */}
          <button
            type="button"
            onClick={togglePlayPause}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isPlaying && !isMuted
                ? 'bg-[#7c3aed] text-white shadow-[0_0_12px_rgba(124,58,237,0.6)]'
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

          {/* Title and Controls */}
          <div className="flex flex-col text-left pr-1 max-w-[150px] sm:max-w-[200px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#ffb2b7] flex items-center gap-1">
                <Music className="w-2.5 h-2.5" /> Música en vivo
              </span>
            </div>
            <span className="text-xs font-semibold text-white truncate" title={config.title || 'Música de Fondo'}>
              {config.title || 'Música de Fondo'}
            </span>
          </div>

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
              <Volume2 className="w-4 h-4 text-[#4cd7f6]" />
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

        {/* Volume Slider Dropdown */}
        {isExpanded && (
          <div className="p-3 rounded-2xl bg-[#191b23]/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-2 w-56 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] text-[#ccc3d8]">
              <span>Volumen</span>
              <span className="font-mono font-bold text-white">{isMuted ? '0%' : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full accent-[#7c3aed] cursor-pointer h-1.5 bg-[#272a32] rounded-lg"
            />
            <div className="flex items-center justify-between pt-1 text-[10px] text-[#958da1]">
              <button
                type="button"
                onClick={togglePlayPause}
                className="hover:text-white flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isPlaying ? 'Desactivar' : 'Activar'}</span>
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

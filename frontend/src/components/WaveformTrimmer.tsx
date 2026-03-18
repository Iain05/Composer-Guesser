import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const MIN_CLIP_SECS = 60;
export const MAX_CLIP_SECS = 120;

export function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseFmt(str: string): number | null {
  const m = str.match(/^(\d+):([0-5]\d)$/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
}

// ─── TimeInput ────────────────────────────────────────────────────────────────

function TimeInput({
  value, min, max, onChange, align = 'left',
}: {
  value: number; min: number; max: number;
  onChange: (t: number) => void; align?: 'left' | 'right';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function startEdit() { setDraft(fmt(value)); setEditing(true); }

  function commit() {
    setEditing(false);
    const parsed = parseFmt(draft);
    if (parsed !== null) onChange(Math.max(min, Math.min(max, parsed)));
  }

  if (editing) {
    return (
      <input
        autoFocus value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className={`w-16 font-mono text-sm bg-surface border border-primary rounded-lg px-2 py-1 text-primary outline-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      />
    );
  }
  return (
    <button onClick={startEdit} title="Click to edit"
      className={`w-16 font-mono text-sm text-ink hover:text-primary bg-surface-warm hover:bg-surface border border-border hover:border-primary/40 rounded-lg px-2 py-1 transition-all ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {fmt(value)}
    </button>
  );
}

// ─── WaveformTrimmer ──────────────────────────────────────────────────────────

export interface WaveformTrimmerProps {
  audioBuffer: AudioBuffer;
  startTime: number;
  endTime: number;
  duration: number;
  onStartChange: (t: number) => void;
  onEndChange: (t: number) => void;
}

export default function WaveformTrimmer({
  audioBuffer, startTime, endTime, duration, onStartChange, onEndChange,
}: WaveformTrimmerProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const peaksRef = useRef<{ min: number; max: number }[]>([]);

  const handleLeftRef  = useRef<HTMLDivElement>(null);
  const handleRightRef = useRef<HTMLDivElement>(null);
  const dimLeftRef     = useRef<HTMLDivElement>(null);
  const dimRightRef    = useRef<HTMLDivElement>(null);
  const accentTopRef   = useRef<HTMLDivElement>(null);
  const accentBotRef   = useRef<HTMLDivElement>(null);
  const playheadDivRef = useRef<HTMLDivElement>(null);
  const clipDurRef     = useRef<HTMLSpanElement>(null);

  // Live trim values — updated imperatively during drag
  const liveStartRef = useRef(startTime);
  const liveEndRef   = useRef(endTime);
  liveStartRef.current = startTime;
  liveEndRef.current   = endTime;

  // Increments on theme change to force canvas redraw
  const [themeVersion, setThemeVersion] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setThemeVersion(v => v + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // ── Playback refs ──────────────────────────────────────────────────────────
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const playStartedAt  = useRef(0);
  const playOffset     = useRef(0);
  const rafRef         = useRef(0);
  const playheadRef    = useRef(startTime);
  const wasPlayingRef  = useRef(false);
  // Lets the [startTime,endTime] effect know a handle drag just ended with
  // a restart request so it should not kill the playback we're about to start.
  const suppressStopRef = useRef(false);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [playheadTime, setPlayheadTime] = useState(startTime);
  // Keep a ref in sync so pointer-event handlers can read it without stale closures
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  function setPlayhead(t: number) {
    playheadRef.current = t;
    setPlayheadTime(t);
    if (playheadDivRef.current)
      playheadDivRef.current.style.left = `${(t / duration) * 100}%`;
  }

  // ── Pre-compute peaks once per audioBuffer ─────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const W = container.clientWidth || 800;
    const data = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.ceil(data.length / W);
    const peaks: { min: number; max: number }[] = new Array(W);
    for (let x = 0; x < W; x++) {
      let min = 0, max = 0;
      const base = x * samplesPerPixel;
      for (let i = 0; i < samplesPerPixel; i++) {
        const s = data[base + i] ?? 0;
        if (s > max) max = s;
        if (s < min) min = s;
      }
      peaks[x] = { min, max };
    }
    peaksRef.current = peaks;
    drawCanvas(startTime, endTime);
  }, [audioBuffer]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas draw ────────────────────────────────────────────────────────────
  function drawCanvas(sT: number, eT: number) {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !peaksRef.current.length) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W === 0 || H === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const primary      = cssVar('--color-primary') || '#c9a84c';
    const primaryFaded = hexToRgba(primary, 0.18);
    const mid  = H / 2;
    const sPct = sT / duration;
    const ePct = eT / duration;
    const peaks = peaksRef.current;
    const len   = Math.min(peaks.length, W);

    for (let x = 0; x < len; x++) {
      const { min, max } = peaks[x];
      ctx.fillStyle = (x / W >= sPct && x / W <= ePct) ? primary : primaryFaded;
      ctx.fillRect(x, mid - max * mid * 0.88, 1, Math.max(1, (mid - min * mid * 0.88) - (mid - max * mid * 0.88)));
    }
  }

  useEffect(() => {
    drawCanvas(startTime, endTime);
  }, [startTime, endTime, themeVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Imperative DOM update during drag — zero React re-renders ─────────────
  function applyLayout(sT: number, eT: number) {
    const sPct = (sT / duration) * 100;
    const ePct = (eT / duration) * 100;
    if (handleLeftRef.current)  handleLeftRef.current.style.left  = `calc(${sPct}% - 16px)`;
    if (handleRightRef.current) handleRightRef.current.style.left = `calc(${ePct}% - 16px)`;
    if (dimLeftRef.current)     dimLeftRef.current.style.width    = `${sPct}%`;
    if (dimRightRef.current)    dimRightRef.current.style.width   = `${100 - ePct}%`;
    if (accentTopRef.current) {
      accentTopRef.current.style.left  = `${sPct}%`;
      accentTopRef.current.style.right = `${100 - ePct}%`;
    }
    if (accentBotRef.current) {
      accentBotRef.current.style.left  = `${sPct}%`;
      accentBotRef.current.style.right = `${100 - ePct}%`;
    }
    // Live-update clip duration display
    const clipSecs = eT - sT;
    if (clipDurRef.current) {
      clipDurRef.current.textContent = fmt(clipSecs);
      clipDurRef.current.className = `font-mono text-xs font-semibold ${clipSecs < MIN_CLIP_SECS || clipSecs > MAX_CLIP_SECS ? 'text-red-400' : 'text-ink-subtle'}`;
    }
    drawCanvas(sT, eT);
  }

  // ── Stop playback and reset playhead when trim props change (e.g. TimeInput)
  // Skipped when a handle drag just ended with a restart so we don't kill the
  // playback we're about to start.
  useEffect(() => {
    if (suppressStopRef.current) {
      suppressStopRef.current = false;
      return;
    }
    cancelAnimationFrame(rafRef.current);
    try { sourceRef.current?.stop(); } catch { /* already stopped */ }
    setIsPlaying(false);
    setPlayhead(startTime);
  }, [startTime, endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    try { sourceRef.current?.stop(); } catch { /* already stopped */ }
    audioCtxRef.current?.close();
  }, []);

  // ── Playback helpers ──────────────────────────────────────────────────────
  function stopPlayback() {
    cancelAnimationFrame(rafRef.current);
    try { sourceRef.current?.stop(); } catch { /* already stopped */ }
  }

  function startPlayback(fromTime: number) {
    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === 'suspended') ctx.resume();
    stopPlayback();

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Always use live refs so a restart after a drag uses the latest bounds
    const playEnd = liveEndRef.current;
    source.start(0, fromTime, playEnd - fromTime);
    sourceRef.current     = source;
    playStartedAt.current = ctx.currentTime;
    playOffset.current    = fromTime;
    setIsPlaying(true);

    function tick() {
      const pos = playOffset.current + ((audioCtxRef.current?.currentTime ?? 0) - playStartedAt.current);
      // Use live refs so moving handles mid-playback is immediately respected
      const curEnd   = liveEndRef.current;
      const curStart = liveStartRef.current;
      if (pos >= curEnd || pos < curStart) {
        cancelAnimationFrame(rafRef.current);
        setIsPlaying(false);
        setPlayhead(curStart);
        return;
      }
      setPlayhead(pos);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function play()  { startPlayback(playheadRef.current); }
  function pause() { stopPlayback(); setIsPlaying(false); }

  function timeFromPointer(e: React.PointerEvent): number {
    const rect = containerRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  }

  // ── Shared handle drag logic ───────────────────────────────────────────────
  function handleDragStart() {
    wasPlayingRef.current = isPlayingRef.current;
    if (isPlayingRef.current) { stopPlayback(); setIsPlaying(false); }
  }

  function handleDragEnd(restartFrom: number) {
    if (wasPlayingRef.current) {
      // Tell the [startTime,endTime] effect not to kill this playback
      suppressStopRef.current = true;
      startPlayback(restartFrom);
    }
  }

  // ── Derived layout (initial render; drags bypass via applyLayout) ──────────
  const startPct     = (startTime    / duration) * 100;
  const endPct       = (endTime      / duration) * 100;
  const headPct      = (playheadTime / duration) * 100;
  const clipDuration = endTime - startTime;
  const tooShort     = clipDuration < MIN_CLIP_SECS;
  const tooLong      = clipDuration > MAX_CLIP_SECS;
  const TAB_W = 16;
  const TAB_H = 5;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Waveform ── */}
      <div
        ref={containerRef}
        className="relative h-32 rounded-xl bg-surface border border-border overflow-visible select-none cursor-default"
        onPointerDown={e => {
          if (!containerRef.current) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.style.cursor = 'grabbing';
          wasPlayingRef.current = isPlayingRef.current;
          if (isPlayingRef.current) { stopPlayback(); setIsPlaying(false); }
          const t = Math.max(liveStartRef.current, Math.min(liveEndRef.current, timeFromPointer(e)));
          playheadRef.current = t;
          if (playheadDivRef.current) playheadDivRef.current.style.left = `${(t / duration) * 100}%`;
        }}
        onPointerMove={e => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) return;
          const t = Math.max(liveStartRef.current, Math.min(liveEndRef.current, timeFromPointer(e)));
          playheadRef.current = t;
          if (playheadDivRef.current) playheadDivRef.current.style.left = `${(t / duration) * 100}%`;
        }}
        onPointerUp={e => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          e.currentTarget.releasePointerCapture(e.pointerId);
          e.currentTarget.style.cursor = '';
          setPlayheadTime(playheadRef.current);
          if (wasPlayingRef.current) startPlayback(playheadRef.current);
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-xl" />

        {/* Dim outside selection */}
        <div ref={dimLeftRef} className="absolute inset-y-0 left-0 bg-canvas/60 pointer-events-none rounded-l-xl"
             style={{ width: `${startPct}%` }} />
        <div ref={dimRightRef} className="absolute inset-y-0 right-0 bg-canvas/60 pointer-events-none rounded-r-xl"
             style={{ width: `${100 - endPct}%` }} />

        {/* Selection accent */}
        <div ref={accentTopRef} className="absolute top-0 h-[2px] bg-primary/30 pointer-events-none"
             style={{ left: `${startPct}%`, right: `${100 - endPct}%` }} />
        <div ref={accentBotRef} className="absolute bottom-0 h-[2px] bg-primary/30 pointer-events-none"
             style={{ left: `${startPct}%`, right: `${100 - endPct}%` }} />

        {/* ── Playhead ── */}
        <div
          ref={playheadDivRef}
          className="absolute inset-y-0 w-4 z-10 pointer-events-none"
          style={{ left: `${headPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute inset-y-0 w-[1.5px] left-1/2 -translate-x-1/2 bg-ink opacity-75" />
          <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 text-ink w-0 h-0"
               style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid currentColor' }} />
        </div>

        {/* ── Left trim handle ── */}
        <div
          ref={handleLeftRef}
          className="absolute inset-y-0 w-8 cursor-col-resize z-20 touch-none"
          style={{ left: `calc(${startPct}% - 16px)` }}
          onPointerDown={e => {
            e.preventDefault(); e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            handleDragStart();
          }}
          onPointerMove={e => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
            const clamped = Math.max(0, Math.min(t, liveEndRef.current - MIN_CLIP_SECS));
            liveStartRef.current = clamped;
            // Clamp playhead to new start if it fell behind
            if (playheadRef.current < clamped) {
              playheadRef.current = clamped;
              if (playheadDivRef.current) playheadDivRef.current.style.left = `${(clamped / duration) * 100}%`;
            }
            applyLayout(clamped, liveEndRef.current);
          }}
          onPointerUp={e => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            const restartFrom = Math.max(playheadRef.current, liveStartRef.current);
            onStartChange(liveStartRef.current);
            handleDragEnd(restartFrom);
          }}
        >
          <div className="absolute inset-y-0 w-[2px] left-1/2 -translate-x-1/2 bg-primary shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
          <div className="absolute bg-primary rounded-r-[3px] shadow-[0_2px_6px_rgba(201,168,76,0.35)]"
               style={{ top: 0, left: '50%', marginLeft: -1, width: TAB_W, height: TAB_H }} />
          <div className="absolute bg-primary rounded-r-[3px] shadow-[0_-2px_6px_rgba(201,168,76,0.35)]"
               style={{ bottom: 0, left: '50%', marginLeft: -1, width: TAB_W, height: TAB_H }} />
        </div>

        {/* ── Right trim handle ── */}
        <div
          ref={handleRightRef}
          className="absolute inset-y-0 w-8 cursor-col-resize z-20 touch-none"
          style={{ left: `calc(${endPct}% - 16px)` }}
          onPointerDown={e => {
            e.preventDefault(); e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            handleDragStart();
          }}
          onPointerMove={e => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
            const clamped = Math.min(duration, Math.max(t, liveStartRef.current + MIN_CLIP_SECS));
            liveEndRef.current = clamped;
            // Clamp playhead to new end if it ran past
            if (playheadRef.current > clamped) {
              playheadRef.current = clamped;
              if (playheadDivRef.current) playheadDivRef.current.style.left = `${(clamped / duration) * 100}%`;
            }
            applyLayout(liveStartRef.current, clamped);
          }}
          onPointerUp={e => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            const restartFrom = Math.min(playheadRef.current, liveEndRef.current);
            onEndChange(liveEndRef.current);
            handleDragEnd(restartFrom);
          }}
        >
          <div className="absolute inset-y-0 w-[2px] left-1/2 -translate-x-1/2 bg-primary shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
          <div className="absolute bg-primary rounded-l-[3px] shadow-[0_2px_6px_rgba(201,168,76,0.35)]"
               style={{ top: 0, right: '50%', marginRight: -1, width: TAB_W, height: TAB_H }} />
          <div className="absolute bg-primary rounded-l-[3px] shadow-[0_-2px_6px_rgba(201,168,76,0.35)]"
               style={{ bottom: 0, right: '50%', marginRight: -1, width: TAB_W, height: TAB_H }} />
        </div>
      </div>

      {/* ── Controls row ── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[10px] font-semibold text-ink-subtle uppercase tracking-widest pl-0.5">Start</span>
          <TimeInput value={startTime} min={0} max={Math.max(0, endTime - MIN_CLIP_SECS)} onChange={onStartChange} align="left" />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={isPlaying ? pause : play}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-text shadow-md hover:bg-primary-hover hover:shadow-lg active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying
              ? <Pause size={15} strokeWidth={2.5} />
              : <Play  size={15} strokeWidth={2.5} className="translate-x-[1px]" />
            }
          </button>
          <span ref={clipDurRef} className={`font-mono text-xs font-semibold ${tooShort || tooLong ? 'text-red-400' : 'text-ink-subtle'}`}>
            {fmt(clipDuration)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-semibold text-ink-subtle uppercase tracking-widest pr-0.5">End</span>
          <TimeInput value={endTime} min={startTime + MIN_CLIP_SECS} max={duration} onChange={onEndChange} align="right" />
        </div>
      </div>

      {/* Minimum duration warning */}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';

type TrackStatus = 'source' | 'recommended' | 'alternate' | 'candidate' | 'diagnostic' | 'invalid';
type TrackGroup = 'reference' | 'final' | 'instrumental' | 'vocal' | 'residual' | 'invalid';

interface Track {
  id: string;
  title: string;
  detail: string;
  file: string;
  group: TrackGroup;
  status: TrackStatus;
  duration: string;
}

const tracks: Track[] = [
  {
    id: 'source',
    title: '原始完整版本',
    detail: 'YouTube 最高品質音訊，保留主唱、合唱、伴奏與現場尾聲。',
    file: '/audio/separation-review/00-source-original.m4a',
    group: 'reference',
    status: 'source',
    duration: '2:34.9',
  },
  {
    id: 'final-mdx',
    title: '推薦排練版 · MDX23C',
    detail: '移除尾段掌聲，2:18 起淡出；−16 LUFS、24-bit 正式母帶的網頁預聽版。',
    file: '/audio/separation-review/01-final-mdx23c-rehearsal.m4a',
    group: 'final',
    status: 'recommended',
    duration: '2:19.5',
  },
  {
    id: 'final-melband',
    title: '備選排練版 · MelBand',
    detail: '與推薦版使用相同長度、淡出與響度設定，適合直接 A/B。',
    file: '/audio/separation-review/02-final-melband-rehearsal.m4a',
    group: 'final',
    status: 'alternate',
    duration: '2:19.5',
  },
  {
    id: 'mdx-instrumental',
    title: 'MDX23C · Instrumental raw',
    detail: '推薦模型未修剪、未做排練母帶處理的完整伴奏 stem。',
    file: '/audio/separation-review/03-mdx23c-instrumental-raw.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'melband-instrumental',
    title: 'MelBand Inst v2 · Instrumental',
    detail: '以 instrumental 為目標訓練的 RoFormer 候選。',
    file: '/audio/separation-review/05-melband-inst-v2-instrumental.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'bs-instrumental',
    title: 'BS-RoFormer 1297 · Instrumental',
    detail: '另一套頻帶分離架構的完整伴奏候選。',
    file: '/audio/separation-review/07-bs-roformer-instrumental.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'melband-other',
    title: 'MelBand Vocal model · Other',
    detail: '以 vocals 為目標的模型所留下的 other stem，可比較訓練目標差異。',
    file: '/audio/separation-review/09-melband-vocal-model-other.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'mdx-vocal',
    title: 'MDX23C · Vocals',
    detail: '推薦模型抽出的主唱與合唱 stem。',
    file: '/audio/separation-review/04-mdx23c-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'melband-inst-vocal',
    title: 'MelBand Inst v2 · Vocals',
    detail: 'instrumental 專用模型分離出的互補 vocal stem。',
    file: '/audio/separation-review/06-melband-inst-v2-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'bs-vocal',
    title: 'BS-RoFormer 1297 · Vocals',
    detail: 'BS-RoFormer 分離出的 vocal stem。',
    file: '/audio/separation-review/08-bs-roformer-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'melband-vocal',
    title: 'MelBand Vocal model · Vocals',
    detail: 'vocals 專用模型直接抽出的人聲結果。',
    file: '/audio/separation-review/10-melband-vocal-model-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'residual-mdx',
    title: '殘留檢測 · MDX23C',
    detail: '把 MDX23C 伴奏再次抽取 vocals；越安靜，代表殘留越少。',
    file: '/audio/separation-review/11-residual-mdx23c.m4a',
    group: 'residual',
    status: 'diagnostic',
    duration: '2:34.9',
  },
  {
    id: 'residual-melband',
    title: '殘留檢測 · MelBand',
    detail: '把 MelBand instrumental 再次抽取 vocals 的結果。',
    file: '/audio/separation-review/12-residual-melband.m4a',
    group: 'residual',
    status: 'diagnostic',
    duration: '2:34.9',
  },
  {
    id: 'residual-bs',
    title: '殘留檢測 · BS-RoFormer',
    detail: '把 BS-RoFormer instrumental 再次抽取 vocals 的結果。',
    file: '/audio/separation-review/13-residual-bs-roformer.m4a',
    group: 'residual',
    status: 'diagnostic',
    duration: '2:34.9',
  },
  {
    id: 'demucs-sum',
    title: 'HTDemucs-ft · Instrumental sum',
    detail: '輸出音量與聲道關係異常，保留供核對，不可作為正式成品。',
    file: '/audio/separation-review/14-htdemucs-instrumental-sum-invalid.m4a',
    group: 'invalid',
    status: 'invalid',
    duration: '2:34.9',
  },
  {
    id: 'demucs-vocals',
    title: 'HTDemucs-ft · Vocals',
    detail: '失敗批次的 vocal stem，僅供診斷。',
    file: '/audio/separation-review/15-htdemucs-vocals-invalid.m4a',
    group: 'invalid',
    status: 'invalid',
    duration: '2:34.9',
  },
  {
    id: 'demucs-drums',
    title: 'HTDemucs-ft · Drums',
    detail: '失敗批次的 drums stem，僅供診斷。',
    file: '/audio/separation-review/16-htdemucs-drums-invalid.m4a',
    group: 'invalid',
    status: 'invalid',
    duration: '2:34.9',
  },
  {
    id: 'demucs-bass',
    title: 'HTDemucs-ft · Bass',
    detail: '失敗批次的 bass stem，僅供診斷。',
    file: '/audio/separation-review/17-htdemucs-bass-invalid.m4a',
    group: 'invalid',
    status: 'invalid',
    duration: '2:34.9',
  },
  {
    id: 'demucs-other',
    title: 'HTDemucs-ft · Other',
    detail: '失敗批次的 other stem，僅供診斷。',
    file: '/audio/separation-review/18-htdemucs-other-invalid.m4a',
    group: 'invalid',
    status: 'invalid',
    duration: '2:34.9',
  },
];

const groups: Array<{ id: TrackGroup; title: string; note: string }> = [
  { id: 'reference', title: '原始參考', note: '先聽原曲，再固定同一秒切換模型。' },
  { id: 'final', title: '正式成品', note: '已修剪尾聲並校正排練音量。' },
  { id: 'instrumental', title: '伴奏候選', note: '未修剪的模型原始輸出。' },
  { id: 'vocal', title: '人聲 stems', note: '用來判斷模型把哪些聲音帶走。' },
  { id: 'residual', title: '人聲殘留檢測', note: '從伴奏再抽一次人聲；越安靜越好。' },
  { id: 'invalid', title: '排除結果', note: '保留失敗輸出，避免只展示成功案例。' },
];

const statusLabels: Record<TrackStatus, string> = {
  source: '原始',
  recommended: '推薦',
  alternate: '備選',
  candidate: '候選',
  diagnostic: '檢測',
  invalid: '排除',
};

const auditionCues = [
  { label: '前奏', time: 4 },
  { label: '主歌', time: 28 },
  { label: '副歌', time: 64 },
  { label: '尾段合唱', time: 116 },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export default function AudioComparison() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const resumeRef = useRef({ time: 0, playing: false });
  const [activeId, setActiveId] = useState('final-mdx');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(139.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const activeTrack = useMemo(
    () => tracks.find((track) => track.id === activeId) ?? tracks[1],
    [activeId],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setLoadError(false);
    const restorePosition = () => {
      const nextTime = Math.min(resumeRef.current.time, Math.max(0, audio.duration - 0.1));
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
      setDuration(audio.duration);
      if (resumeRef.current.playing) {
        void audio.play().catch(() => setIsPlaying(false));
      }
    };

    audio.addEventListener('loadedmetadata', restorePosition, { once: true });
    audio.load();
    return () => audio.removeEventListener('loadedmetadata', restorePosition);
  }, [activeId]);

  const selectTrack = (id: string) => {
    if (id === activeId) return;
    const audio = audioRef.current;
    resumeRef.current = {
      time: audio?.currentTime ?? currentTime,
      playing: audio ? !audio.paused : isPlaying,
    };
    setActiveId(id);
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setLoadError(true));
    } else {
      audio.pause();
    }
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, time), duration || 0);
    setCurrentTime(audio.currentTime);
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="audio-compare">
      <section className="listen-desk" aria-labelledby="active-track-title">
        <div className="listen-desk__topline">
          <div>
            <span className={`track-status track-status--${activeTrack.status}`}>
              {statusLabels[activeTrack.status]}
            </span>
            <p>目前播放</p>
          </div>
          <span className="listen-desk__count">19 個可比較音軌</span>
        </div>

        <div className="listen-desk__title-row">
          <div>
            <h2 id="active-track-title">{activeTrack.title}</h2>
            <p>{activeTrack.detail}</p>
          </div>
          <a className="download-preview" href={activeTrack.file} download>
            下載預聽檔
          </a>
        </div>

        <audio
          ref={audioRef}
          src={activeTrack.file}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          onError={() => setLoadError(true)}
        />

        <div className="piano-progress" style={{ '--audio-progress': `${progress}%` } as React.CSSProperties} aria-hidden="true">
          {Array.from({ length: 24 }).map((_, index) => <span key={index} />)}
        </div>

        <div className="transport">
          <button className="transport__play" type="button" onClick={togglePlayback} aria-label={isPlaying ? '暫停' : '播放'}>
            <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
          </button>
          <button type="button" className="transport__jump" onClick={() => seekTo(currentTime - 5)} aria-label="倒退五秒">−5</button>
          <div className="transport__timeline">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.05"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seekTo(Number(event.currentTarget.value))}
              aria-label="播放進度"
            />
            <div className="transport__time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <button type="button" className="transport__jump" onClick={() => seekTo(currentTime + 5)} aria-label="前進五秒">+5</button>
        </div>

        <div className="audition-cues" aria-label="快速跳到比較段落">
          <span>快速定位</span>
          {auditionCues.map((cue) => (
            <button type="button" key={cue.label} onClick={() => seekTo(cue.time)}>
              {cue.label}<small>{formatTime(cue.time)}</small>
            </button>
          ))}
        </div>

        {loadError && (
          <p className="audio-error" role="alert">音檔載入失敗。請重新整理頁面，或使用右上角下載預聽檔。</p>
        )}
      </section>

      <aside className="comparison-note" aria-label="比較方式">
        <span className="comparison-note__number">A/B</span>
        <div>
          <h2>比較時不會跳回開頭</h2>
          <p>先選一個容易聽出人聲的段落，再切換下方音軌。播放秒數與播放狀態都會保留。</p>
        </div>
      </aside>

      <section className="result-metrics" aria-labelledby="metrics-title">
        <div className="section-heading">
          <p>Objective check</p>
          <h2 id="metrics-title">三個主要候選的量測結果</h2>
          <span>數字是輔助，不代替實際聆聽。</span>
        </div>
        <div className="metrics-table" aria-label="模型量測比較">
          <div className="metrics-row metrics-row--head">
            <span>模型</span>
            <span>伴奏相關性 ↑</span>
            <span>頻譜距離 ↓</span>
            <span>殘留人聲 ↓</span>
          </div>
          <button type="button" className="metrics-row metrics-row--winner" onClick={() => selectTrack('mdx-instrumental')} aria-label="播放 MDX23C 原始伴奏候選">
            <strong>MDX23C <small>推薦</small></strong>
            <span>0.830</span><span>5.581 dB</span><span>−64.94 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('melband-instrumental')} aria-label="播放 MelBand Inst v2 原始伴奏候選">
            <strong>MelBand Inst v2</strong>
            <span>0.826</span><span>5.806 dB</span><span>−58.70 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('bs-instrumental')} aria-label="播放 BS-RoFormer 原始伴奏候選">
            <strong>BS-RoFormer</strong>
            <span>0.818</span><span>6.686 dB</span><span>−60.23 dBFS</span>
          </button>
        </div>
      </section>

      <section className="track-library" aria-labelledby="library-title">
        <div className="section-heading section-heading--library">
          <p>All generated audio</p>
          <h2 id="library-title">全部音軌</h2>
          <span>網頁預聽皆為 256 kbps AAC；正式 WAV 沒有被覆寫。</span>
        </div>

        {groups.map((group) => {
          const groupTracks = tracks.filter((track) => track.group === group.id);
          return (
            <section className="track-group" key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="track-group__heading">
                <h3 id={`group-${group.id}`}>{group.title}</h3>
                <p>{group.note}</p>
              </div>
              <div className="track-list">
                {groupTracks.map((track) => {
                  const isActive = track.id === activeId;
                  return (
                    <button
                      type="button"
                      className={`track-row${isActive ? ' track-row--active' : ''}${track.status === 'invalid' ? ' track-row--invalid' : ''}`}
                      key={track.id}
                      onClick={() => isActive ? togglePlayback() : selectTrack(track.id)}
                      aria-pressed={isActive}
                    >
                      <span className="track-row__play" aria-hidden="true">{isActive && isPlaying ? 'Ⅱ' : '▶'}</span>
                      <span className="track-row__copy">
                        <span className="track-row__title">
                          {track.title}
                          <span className={`track-status track-status--${track.status}`}>{statusLabels[track.status]}</span>
                        </span>
                        <span className="track-row__detail">{track.detail}</span>
                      </span>
                      <span className="track-row__duration">{track.duration}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="excluded-note">
          <strong>未放入：</strong>一次誤觸的訂閱限定 HQ2 模型輸出。它不屬於可正式採用的候選，因此沒有納入比較或交付。
        </p>
      </section>
    </div>
  );
}

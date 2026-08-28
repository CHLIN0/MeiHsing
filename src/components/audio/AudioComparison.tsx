import { useEffect, useMemo, useRef, useState } from 'react';

type TrackStatus = 'source' | 'recommended' | 'alternate' | 'candidate' | 'diagnostic' | 'invalid';
type TrackGroup = 'reference' | 'final' | 'instrumental' | 'vocal' | 'stem' | 'residual' | 'invalid';

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
    id: 'final-demucs-4-1',
    title: '聽感排除 · Demucs 4.1',
    detail: '量測通過，但人工 A/B 認為整體偏混；保留研究對照，不取代 MDX23C。',
    file: '/audio/separation-review/19-demucs-4.1-candidate-rehearsal.m4a',
    group: 'final',
    status: 'alternate',
    duration: '2:19.5',
  },
  {
    id: 'final-scnet-xl',
    title: '優先盲聽 · SCNet XL IHF',
    detail: 'drums、bass、other 三 stem 重建；同規格母帶，客觀結果最值得和 MDX23C 直接比較。',
    file: '/audio/separation-review/25-scnet-xl-rehearsal.m4a',
    group: 'final',
    status: 'candidate',
    duration: '2:19.5',
  },
  {
    id: 'final-scnet-masked',
    title: '候選排練版 · SCNet Masked XL',
    detail: 'Masked XL 的三 stem 重建與同規格母帶；殘留低於 MDX23C，但仍需人工聽音色完整度。',
    file: '/audio/separation-review/26-scnet-masked-xl-rehearsal.m4a',
    group: 'final',
    status: 'candidate',
    duration: '2:19.5',
  },
  {
    id: 'final-bs-large',
    title: '候選排練版 · BS-RoFormer Large',
    detail: 'Large-Inst 原生 instrument 輸出的同規格母帶。',
    file: '/audio/separation-review/23-bs-large-rehearsal.m4a',
    group: 'final',
    status: 'candidate',
    duration: '2:19.5',
  },
  {
    id: 'final-duality-v2',
    title: '候選排練版 · Duality v2',
    detail: 'MelBand InstVoc Duality v2 原生 instrumental 輸出的同規格母帶。',
    file: '/audio/separation-review/24-duality-v2-rehearsal.m4a',
    group: 'final',
    status: 'candidate',
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
    id: 'demucs-4-1-instrumental',
    title: 'Demucs 4.1 · HTDemucs-ft minus vocals',
    detail: '官方 4.1.0 runtime 以 htdemucs_ft、two-stem、minus 重跑的完整伴奏；不是先前異常的 stem 加總結果。',
    file: '/audio/separation-review/20-demucs-4.1-minus-raw.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'scnet-xl-instrumental',
    title: 'SCNet XL IHF · Instrumental stem sum',
    detail: 'drums、bass、other 原生 stems 直接相加；不是原曲減 vocals。',
    file: '/audio/separation-review/30-scnet-xl-instrumental-sum.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'scnet-masked-instrumental',
    title: 'SCNet Masked XL IHF · Instrumental stem sum',
    detail: 'Masked XL 的 drums、bass、other 原生 stems 直接相加。',
    file: '/audio/separation-review/36-scnet-masked-instrumental-sum.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'bs-large-instrumental',
    title: 'BS-RoFormer Large Inst · Instrumental',
    detail: 'Large-Inst checkpoint 直接輸出的原生 instrument stem。',
    file: '/audio/separation-review/27-bs-large-instrumental-raw.m4a',
    group: 'instrumental',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'duality-v2-instrumental',
    title: 'MelBand InstVoc Duality v2 · Instrumental',
    detail: 'Duality v2 checkpoint 直接輸出的原生 instrumental stem。',
    file: '/audio/separation-review/28-duality-v2-instrumental.m4a',
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
    id: 'demucs-4-1-vocals',
    title: 'Demucs 4.1 · Vocals',
    detail: '同一次官方 Demucs 4.1.0 two-stem 推論抽出的人聲，可檢查伴奏是否被一併帶走。',
    file: '/audio/separation-review/21-demucs-4.1-vocals.m4a',
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
    id: 'duality-v2-vocals',
    title: 'MelBand InstVoc Duality v2 · Vocals',
    detail: 'Duality v2 同一次推論輸出的互補 vocal stem。',
    file: '/audio/separation-review/29-duality-v2-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'scnet-xl-vocals',
    title: 'SCNet XL IHF · Vocals',
    detail: 'SCNet XL 四 stem 推論中的 vocal stem。',
    file: '/audio/separation-review/31-scnet-xl-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'scnet-masked-vocals',
    title: 'SCNet Masked XL IHF · Vocals',
    detail: 'SCNet Masked XL 四 stem 推論中的 vocal stem。',
    file: '/audio/separation-review/37-scnet-masked-vocals.m4a',
    group: 'vocal',
    status: 'candidate',
    duration: '2:34.9',
  },
  {
    id: 'scnet-xl-drums', title: 'SCNet XL IHF · Drums', detail: '原生 drums stem。',
    file: '/audio/separation-review/32-scnet-xl-drums.m4a', group: 'stem', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'scnet-xl-bass', title: 'SCNet XL IHF · Bass', detail: '原生 bass stem。',
    file: '/audio/separation-review/33-scnet-xl-bass.m4a', group: 'stem', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'scnet-xl-other', title: 'SCNet XL IHF · Other', detail: '原生 other stem，主要包含鋼琴、弦樂與其餘伴奏。',
    file: '/audio/separation-review/34-scnet-xl-other.m4a', group: 'stem', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'scnet-masked-drums', title: 'SCNet Masked XL IHF · Drums', detail: '原生 drums stem。',
    file: '/audio/separation-review/38-scnet-masked-drums.m4a', group: 'stem', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'scnet-masked-bass', title: 'SCNet Masked XL IHF · Bass', detail: '原生 bass stem。',
    file: '/audio/separation-review/39-scnet-masked-bass.m4a', group: 'stem', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'scnet-masked-other', title: 'SCNet Masked XL IHF · Other', detail: '原生 other stem。',
    file: '/audio/separation-review/40-scnet-masked-other.m4a', group: 'stem', status: 'diagnostic', duration: '2:34.9',
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
    id: 'residual-demucs-4-1',
    title: '殘留檢測 · Demucs 4.1',
    detail: '把 Demucs 4.1 minus-vocals 伴奏交給同一個 MelBand 偵測器再次抽取 vocals；量測為 −82.18 dBFS。',
    file: '/audio/separation-review/22-residual-demucs-4.1.m4a',
    group: 'residual',
    status: 'diagnostic',
    duration: '2:34.9',
  },
  {
    id: 'residual-scnet-xl',
    title: '殘留檢測 · SCNet XL IHF',
    detail: '從三 stem 伴奏重建再次抽 vocals；量測為 −80.43 dBFS。',
    file: '/audio/separation-review/44-residual-scnet-xl-sum.m4a',
    group: 'residual', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'residual-scnet-masked',
    title: '殘留檢測 · SCNet Masked XL',
    detail: '從三 stem 伴奏重建再次抽 vocals；量測為 −66.04 dBFS。',
    file: '/audio/separation-review/45-residual-scnet-masked-sum.m4a',
    group: 'residual', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'residual-bs-large',
    title: '殘留檢測 · BS-RoFormer Large',
    detail: '從 Large-Inst 伴奏再次抽 vocals；量測為 −61.72 dBFS。',
    file: '/audio/separation-review/42-residual-bs-large.m4a',
    group: 'residual', status: 'diagnostic', duration: '2:34.9',
  },
  {
    id: 'residual-duality-v2',
    title: '殘留檢測 · Duality v2',
    detail: '從 Duality v2 伴奏再次抽 vocals；量測為 −60.56 dBFS。',
    file: '/audio/separation-review/43-residual-duality-v2.m4a',
    group: 'residual', status: 'diagnostic', duration: '2:34.9',
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
  {
    id: 'scnet-xl-mix-minus',
    title: 'SCNet XL · Mix-minus vocals',
    detail: '原曲減 SCNet vocal stem 後仍有大量人聲；不作伴奏候選。',
    file: '/audio/separation-review/35-scnet-xl-mix-minus-invalid.m4a',
    group: 'invalid', status: 'invalid', duration: '2:34.9',
  },
  {
    id: 'residual-scnet-xl-minus',
    title: '殘留檢測 · SCNet XL mix-minus',
    detail: '殘留人聲約 −15.56 dBFS，證實此重建方式不可採用。',
    file: '/audio/separation-review/46-residual-scnet-xl-minus.m4a',
    group: 'invalid', status: 'invalid', duration: '2:34.9',
  },
  {
    id: 'scnet-masked-mix-minus',
    title: 'SCNet Masked XL · Mix-minus vocals',
    detail: '原曲減 SCNet vocal stem 後仍有大量人聲；不作伴奏候選。',
    file: '/audio/separation-review/41-scnet-masked-mix-minus-invalid.m4a',
    group: 'invalid', status: 'invalid', duration: '2:34.9',
  },
  {
    id: 'residual-scnet-masked-minus',
    title: '殘留檢測 · SCNet Masked XL mix-minus',
    detail: '殘留人聲約 −15.54 dBFS，證實此重建方式不可採用。',
    file: '/audio/separation-review/47-residual-scnet-masked-minus.m4a',
    group: 'invalid', status: 'invalid', duration: '2:34.9',
  },
];

const groups: Array<{ id: TrackGroup; title: string; note: string }> = [
  { id: 'reference', title: '原始參考', note: '先聽原曲，再固定同一秒切換模型。' },
  { id: 'final', title: '正式成品', note: '已修剪尾聲並校正排練音量。' },
  { id: 'instrumental', title: '伴奏候選', note: '未修剪的模型原始輸出。' },
  { id: 'vocal', title: '人聲 stems', note: '用來判斷模型把哪些聲音帶走。' },
  { id: 'stem', title: 'SCNet 樂器 stems', note: '保留四 stem 模型的原生分軌，供後續研究與局部補償。' },
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
          <span className="listen-desk__count">{tracks.length} 個可比較音軌</span>
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
          <h2 id="metrics-title">同條件量測與人工決策</h2>
          <span>同一組區段與偵測器；數字只用來篩選，最後仍以聆聽決定。</span>
        </div>
        <div className="metrics-table" aria-label="模型量測比較">
          <div className="metrics-row metrics-row--head">
            <span>模型</span>
            <span>伴奏相關性 ↑</span>
            <span>頻譜距離 ↓</span>
            <span>殘留人聲 ↓</span>
          </div>
          <button type="button" className="metrics-row metrics-row--winner" onClick={() => selectTrack('mdx-instrumental')} aria-label="播放 MDX23C 原始伴奏候選">
            <strong>MDX23C <small>目前保底</small></strong>
            <span>0.830</span><span>5.581 dB</span><span>−64.94 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('scnet-xl-instrumental')} aria-label="播放 SCNet XL IHF 伴奏候選">
            <strong>SCNet XL IHF <small>優先盲聽</small></strong>
            <span>0.831</span><span>5.647 dB</span><span>−80.43 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('scnet-masked-instrumental')} aria-label="播放 SCNet Masked XL IHF 伴奏候選">
            <strong>SCNet Masked XL</strong>
            <span>0.831</span><span>6.010 dB</span><span>−66.04 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('demucs-4-1-instrumental')} aria-label="播放 Demucs 4.1 原始伴奏">
            <strong>Demucs 4.1 <small>聽感排除</small></strong>
            <span>0.829</span><span>5.573 dB</span><span>−82.18 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('bs-large-instrumental')} aria-label="播放 BS-RoFormer Large 伴奏候選">
            <strong>BS-RoFormer Large</strong>
            <span>0.824</span><span>5.593 dB</span><span>−61.72 dBFS</span>
          </button>
          <button type="button" className="metrics-row" onClick={() => selectTrack('duality-v2-instrumental')} aria-label="播放 Duality v2 伴奏候選">
            <strong>Duality v2</strong>
            <span>0.819</span><span>6.233 dB</span><span>−60.56 dBFS</span>
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

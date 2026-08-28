# 《明天會更好》伴奏分離研究紀錄

最後更新：2026-08-28（Asia/Taipei）

這份文件記錄 2026 林美杏老師師生音樂會大合唱伴奏的模型來源、實驗參數、量測方式、失敗案例與決策。目的是讓正式排練版本的選擇可以重現，也保留日後研究多樂器 stems 的依據。

## 目前決策

- **正式選擇維持 MDX23C**：它仍是目前人工聽感最平衡的版本。比較用排練母帶維持 2:19.5；音樂會頁改用 2:34.965 完整尾奏版，歌詞同步在 2:19.5 結束後音樂繼續播放，不再隨歌詞直接截斷。
- **Demucs 4.1 已由人工聽感排除**：`htdemucs_ft + two-stem + minus` 的客觀量測通過，但實際 A/B 聽起來比 MDX23C 混；保留作研究對照，不取代保底。
- **SCNet XL IHF 進入優先盲聽**：以 `drums + bass + other` 重建伴奏，無主唱段相關性 0.8307、殘留偵測 −80.43 dBFS；數字足以進入人工比較，但尚未宣布優於 MDX23C。
- **其餘新候選保留**：SCNet Masked XL IHF、BS-RoFormer Large Inst、MelBand InstVoc Duality v2 均已用相同母帶規格輸出，等待同秒數人工 A/B。
- **多樂器分軌是後續研究**：目前不為了做出商用工具般的 mixer，犧牲大合唱伴奏的交付品質與時間。

精確版本、完整命令、checkpoint／config／輸出 SHA-256、重建方法與母帶參數另以機器可讀格式保存在 [`audio-separation-experiment-manifest.yaml`](audio-separation-experiment-manifest.yaml)。

## 優先順序

1. 人聲足夠低，不會在全體合唱與排練擴音時干擾。
2. 鋼琴、弦樂、鼓與和聲不能因移除人聲而明顯破洞、抽吸或失去瞬態。
3. 母帶長度、淡出與響度適合現場排練。
4. 在前三項穩定後，再研究可調式多樂器 stems 與更複雜的 ensemble。

## 模型與來源

「架構公開時間」與「本次使用的 checkpoint（權重檔）公開時間」是兩件事。部分 UVR 社群 checkpoint 的 registry 沒有可靠的首次發布日期；這裡明確標成「未記錄」，不從檔名或本機下載時間猜測。

| 本次路徑 | 架構／runtime | 公開時間與維護狀態 | 主要特性 | 本次 checkpoint 來源 |
|---|---|---|---|---|
| MDX23C HQ | MDX23C，基於 TFC-TDF v3 類架構 | 社群訓練框架持續收錄；本 checkpoint 首次發布日未記錄 | 頻譜域兩 stem 分離；本次結果原本在人聲殘留與伴奏保真間最均衡 | UVR public registry：`MDX23C-8KFFT-InstVoc_HQ.ckpt`；SHA-256 `49d514…d816` |
| MelBand Inst v2 | Mel-Band RoFormer | 論文預印本 2023-10；ICASSP 2024 | 依 mel scale 建立重疊頻帶，沿時間與頻率做 attention；此權重以 instrumental 為目標 | [pcunwa/Mel-Band-Roformer-Inst](https://huggingface.co/pcunwa/Mel-Band-Roformer-Inst)；`melband_roformer_inst_v2.ckpt`；SHA-256 `bd1976…e1f2` |
| BS-RoFormer 1297 | Band-Split RoPE Transformer | 論文預印本 2023-09；ICASSP 2024 | 將頻譜切成多個 band，沿時間與 band 軸使用 RoPE Transformer | 原 UVR registry 指向 TRvlvr public model release；`model_bs_roformer_ep_317_sdr_12.9755.ckpt`；SHA-256 `5b84f3…15aa` |
| Demucs 4.1 對照 | `demucs==4.1.0` + `htdemucs_ft` | Python package 4.1.0 發布於 2026-07-11；模型架構與預訓練權重仍屬 Demucs v4 世代，**4.1.0 不是新模型** | Hybrid Transformer Demucs 同時使用波形與頻譜路徑；本次用 mixture-minus-vocals 保持混合一致性 | 由 Demucs 官方 model registry 下載的 `htdemucs_ft` bag（4 個 fine-tuned models） |
| BS-RoFormer Large Inst | BS-RoFormer Large-Inst + OpenMIRLab MLX wrapper | wrapper commit `b0f1386`（2026-08-17），本機 package 0.1.6 | 在標準 BS-RoFormer 上增加 Large-Inst head；原生輸出 instrument stem | [pcunwa/BS-Roformer-Large-Inst](https://huggingface.co/pcunwa/BS-Roformer-Large-Inst)；checkpoint SHA-256 `09251a…4bc4` |
| MelBand InstVoc Duality v2 | Mel-Band RoFormer，雙 stem | checkpoint 首次發布日未記錄 | 同一次模型直接輸出 Vocals 與 Instrumental，不用 mixture-minus | [pcunwa/Mel-Band-Roformer-InstVoc-Duality](https://huggingface.co/pcunwa/Mel-Band-Roformer-InstVoc-Duality)；checkpoint SHA-256 `b4a695…e20f` |
| SCNet XL IHF | SCNet 4-stem + OpenMIRLab MLX wrapper | SCNet 架構 2024；checkpoint release v1.0.15；wrapper 0.1.0 commit `a5437e3` | 直接輸出 drums、bass、other、vocals；本次用前三者相加重建伴奏 | [ZFTurbo MSST v1.0.15](https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/tag/v1.0.15)；checkpoint SHA-256 `ac2597…b74f` |
| SCNet Masked XL IHF | SCNet Masked 4-stem + OpenMIRLab MLX wrapper | checkpoint release v1.0.17；wrapper 同上 | 加入 masked variant；同樣以三個非人聲 stems 重建 | [ZFTurbo MSST v1.0.17](https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/tag/v1.0.17)；checkpoint SHA-256 `b4675b…b6dd` |

主要來源：

- [adefossez/demucs](https://github.com/adefossez/demucs)：目前 README 指定的官方維護 fork。作者也明確說明目前不積極開發新功能，因此應視為「可用但低速維護」，不能只因 package 在 2026 更新就推論模型也是新的。
- [facebookresearch/demucs](https://github.com/facebookresearch/demucs)：原 Meta／Facebook Research repository，已於 2025-01-01 archive，README 指向上面的作者 fork。
- [Demucs 4.1.0 release notes](https://github.com/adefossez/demucs/blob/main/docs/release.md)：4.1.0 主要是 packaging、Python／PyTorch 相容性、音訊 I/O、checkpoint 儲存與 `--other-method` 等工程更新。
- [Demucs on PyPI](https://pypi.org/project/demucs/)：4.1.0 發布日期與 Python 需求。
- [Music Source Separation with Band-Split RoPE Transformer](https://arxiv.org/abs/2309.02612) 與 [Mel-Band RoFormer for Music Source Separation](https://arxiv.org/abs/2310.01809)：BS-RoFormer、Mel-Band RoFormer 原始論文。
- [scf4/msst](https://github.com/scf4/msst)：同時收錄 MDX23C、Demucs4HT、BS-RoFormer、Mel-Band RoFormer 等架構的開源訓練框架，可用於追查架構 lineage，但不等於每個社群 checkpoint 的原始發布頁。

## Demucs 4.1.0 重跑

### 為什麼舊結果不能拿來評分

先前 MLX／UVR 路徑產生的 `HTDemucs-ft instrumental-sum` 峰值只有 −27.90 dBFS、RMS −54.06 dBFS，左右聲道相關性 −0.085；這是輸出或 stem 組合異常，不是 HTDemucs 模型能力的有效證據。舊檔保留在比較頁的「排除結果」，避免日後誤認為已經正常測過。

### 可重現命令

```bash
uvx --python 3.12 --with numpy --from demucs==4.1.0 demucs \
  -n htdemucs_ft \
  --two-stems vocals \
  --other-method minus \
  --shifts 2 \
  --overlap 0.5 \
  --float32 \
  -o <output-directory> \
  <source-wav>
```

本機環境：Apple Silicon Metal（MPS）、Python 3.12、Demucs 4.1.0、FFmpeg 8.1。推論使用 `htdemucs_ft` 的 4-model bag。

`--other-method minus` 會以原始 mixture 減去預測 vocals，直接產生 `minus_vocals.wav`；對這次「只要可唱的伴奏」比把 drums、bass、other stems 相加更合適，也避開上一輪的錯誤加總路徑。

### 實際遇到的問題

- 乾淨執行 `uvx --from demucs==4.1.0 demucs` 會在 import 時出現 `ModuleNotFoundError: numpy`。本次以 `--with numpy` 補足。這是 4.1.0 packaging 的實際可重現缺口，不代表模型失敗。
- 本機 MLX 殘留檢測在 sandbox 內看不到 Metal GPU；改在獲准的非 sandbox 執行後完成。cache 位置用 `MLX_AUDIO_SEPARATOR_CACHE_DIR` 明確指向暫存目錄。

## 同條件客觀比較

觀測時間：2026-08-28。來源音訊 44.1 kHz stereo；所有候選與原曲以相同七個已確認無主唱區間比較。殘留人聲則把每個候選伴奏送入同一個 `vocals_mel_band_roformer` 偵測器，再量測 5.2–138.2 秒的 vocal stem RMS。

| 候選 | 無主唱段相關性 ↑ | Log-spectral distance ↓ | 殘留人聲 RMS ↓ | 殘留／候選能量比 ↓ |
|---|---:|---:|---:|---:|
| **MDX23C HQ（現行保底）** | **0.8302** | 5.5808 dB | −64.94 dBFS | −43.48 dB |
| **SCNet XL IHF（優先盲聽）** | **0.8307** | 5.6472 dB | −80.43 dBFS | −58.92 dB |
| SCNet Masked XL IHF | 0.8306 | 6.0102 dB | −66.04 dBFS | −44.47 dB |
| Demucs 4.1 `htdemucs_ft minus`（聽感排除） | 0.8292 | **5.5732 dB** | **−82.18 dBFS** | **−60.67 dB** |
| BS-RoFormer Large Inst | 0.8237 | 5.5930 dB | −61.72 dBFS | −40.30 dB |
| MelBand InstVoc Duality v2 | 0.8189 | 6.2330 dB | −60.56 dBFS | −39.14 dB |
| MelBand Inst v2 | 0.8262 | 5.8063 dB | −58.70 dBFS | −37.25 dB |
| BS-RoFormer 1297 | 0.8180 | 6.6861 dB | −60.23 dBFS | −38.80 dB |

解讀：Demucs 的數字仍然很好，但人工已判定它比 MDX23C 混，證明殘留越低不等於整體越可用。SCNet XL 的三 stem 重建在不使用 mixture-minus 的情況下，同時得到接近 MDX23C 的伴奏保真與極低殘留，因此成為下一個優先盲聽對象。SCNet 的 `原曲 − vocal stem` 兩版殘留皆約 −15.5 dBFS，已明確排除；這些 vocal stems 並非可直接從 mixture 做 sample-level subtraction 的估計。

## 需人工檢查的段落

比較頁切換模型時會保留播放秒數。至少檢查：

- 0:28 左右：主歌的人聲尾音是否殘留，鋼琴是否被抽薄。
- 1:04 左右：副歌密度增加時是否出現 pumping（抽吸感）或混響鬼影。
- 1:56 左右：尾段合唱是否仍有可辨識原唱，鼓與弦樂是否破碎。
- 先聽同規格的「推薦排練版 · MDX23C」與「優先盲聽 · SCNet XL IHF」，再比較 Masked XL、BS Large 與 Duality v2；Demucs 留在頁上驗證「量測好但聽感偏混」的已知案例。

## 新候選母帶與雜湊

- WAV：`/private/tmp/video-digest/sR2d5NTOda4/final/明天會更好_伴奏_CANDIDATE_Demucs4.1_排練版.wav`
- 規格：2:19.5；2:18.0 起 1.5 秒淡出；44.1 kHz stereo 24-bit PCM；實測 −16.0 LUFS、−1.0 dBTP。
- SHA-256：`79ea23d2f5664305d47dbf3901ef5269cc1ae175d42682928829d7c3aaed32ca`
- 網頁 AAC 預聽：`public/audio/separation-review/19-demucs-4.1-candidate-rehearsal.m4a`；SHA-256 `8451ed…1ea3`。
- 原始 minus-vocals、抽出 vocals 與 residual 檢測也已放進內部比較頁；現有正式 WAV 沒有覆寫。

所有新增母帶均為 2:19.5、2:18.0 起 1.5 秒淡出、44.1 kHz stereo 24-bit PCM，使用 two-pass FFmpeg `loudnorm`；驗證結果介於 −16.03 至 −16.04 LUFS、約 −0.99 dBTP。

| 候選母帶 | WAV SHA-256 | 網頁預聽 SHA-256 |
|---|---|---|
| BS-RoFormer Large Inst | `ee5f40…b7d9` | `b45bbb…b5c` |
| MelBand InstVoc Duality v2 | `1fc598…cae8` | `13d1e4…d4e` |
| SCNet XL IHF | `02844b…9a3b` | `1cb787…dda` |
| SCNet Masked XL IHF | `1b17bd…3084` | `f0244e…712f` |

母帶程式是 [`scripts/audio-separation/master_rehearsal.py`](../scripts/audio-separation/master_rehearsal.py)。每次執行會保存 first-pass loudness、輸出雜湊與獨立 verification pass；不能只憑檔名宣稱規格正確。

## 下一輪研究方向

在 SCNet XL 與 MDX23C 完成同條件盲聽前，不擴大成多樂器 mixer。若仍能聽到短段伴奏被挖空，依下列順序研究：

1. **區段式補償**：標記問題時間，只在局部比較 MDX23C、SCNet XL 與 Masked XL，做有 crossfade 的替換；避免整首為了少數瑕疵重新犧牲品質。
2. **保守 ensemble**：在 MDX23C 與 SCNet XL 間做頻譜 mask／complex-domain 融合，而不是直接平均兩個波形；驗證相位與瞬態後才採用。
3. **更新的開源 vocal specialist**：只測有公開 code、權重、license 與可追溯 checkpoint 的模型；不能只看商用 demo。
4. **多 stem 研究**：Demucs `htdemucs_6s` 可輸出 vocals、drums、bass、guitar、piano、other，但官方 README 明示 piano stem 有明顯 bleed 與 artifacts，暫不當作演出伴奏主線。

每個新實驗都必須保留：來源 URL、license、版本／commit、checkpoint SHA-256、完整命令、輸出雜湊、客觀指標、人工聽感時間點與「採用／候選／排除」結論。

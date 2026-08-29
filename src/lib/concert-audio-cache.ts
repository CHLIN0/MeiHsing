export type ConcertAudioAssetOrigin = 'cache' | 'network';

export const concertAudioCacheName = 'concert-2026-audio-v3';
export const concertAudioCachePrefix = 'concert-2026-audio-';
export const concertProgrammeMediaCacheName = 'concert-2026-programme-media-v3';
export const concertProgrammeMediaCachePrefix = 'concert-2026-programme-media-';

type LoadConcertAudioAssetOptions = {
    source: string;
    expectedBytes: number;
    cache: ConcertAudioStore | null;
    forceNetwork?: boolean;
    onProgress: (loadedBytes: number) => void;
};

export type ConcertAudioAssetResult = {
    blob: Blob;
    origin: ConcertAudioAssetOrigin;
};

export type ConcertAudioStore = {
    kind: 'cache-storage' | 'indexed-db';
    delete: (source: string) => Promise<boolean>;
    get: (source: string) => Promise<Response | undefined>;
    put: (source: string, response: Response) => Promise<void>;
};

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

const openIndexedDbStore = (cacheName: string, defaultContentType: string) => new Promise<ConcertAudioStore | null>((resolve) => {
    if (!('indexedDB' in window)) {
        resolve(null);
        return;
    }

    const request = window.indexedDB.open(cacheName, 1);
    request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('assets')) database.createObjectStore('assets');
    };
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
        const database = request.result;
        const transact = <T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) => new Promise<T>((resolveRequest, rejectRequest) => {
            const transaction = database.transaction('assets', mode);
            const storeRequest = action(transaction.objectStore('assets'));
            storeRequest.onsuccess = () => resolveRequest(storeRequest.result);
            storeRequest.onerror = () => rejectRequest(storeRequest.error);
        });

        resolve({
            kind: 'indexed-db',
            delete: async (source) => {
                await transact('readwrite', (store) => store.delete(source));
                return true;
            },
            get: async (source) => {
                const blob = await transact<Blob | undefined>('readonly', (store) => store.get(source));
                return blob instanceof Blob ? new Response(blob, { headers: { 'content-type': blob.type || defaultContentType } }) : undefined;
            },
            put: async (source, response) => {
                const blob = await response.blob();
                await transact('readwrite', (store) => store.put(blob, source));
            },
        });
    };
});

const openAssetCache = async (cacheName: string, cachePrefix: string, defaultContentType: string): Promise<ConcertAudioStore | null> => {
    if (!window.isSecureContext || !('caches' in window)) return openIndexedDbStore(cacheName, defaultContentType);

    try {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames
            .filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
            .map((name) => window.caches.delete(name)));
        const cache = await window.caches.open(cacheName);
        return {
            kind: 'cache-storage',
            delete: (source) => cache.delete(source),
            get: (source) => cache.match(source),
            put: (source, response) => cache.put(source, response),
        };
    } catch {
        return openIndexedDbStore(cacheName, defaultContentType);
    }
};

export const openConcertAudioCache = () => openAssetCache(concertAudioCacheName, concertAudioCachePrefix, 'audio/mp4');
export const openConcertProgrammeMediaCache = () => openAssetCache(
    concertProgrammeMediaCacheName,
    concertProgrammeMediaCachePrefix,
    'video/mp4',
);

const readResponse = async (
    response: Response,
    expectedBytes: number,
    onProgress: (loadedBytes: number) => void,
    defaultContentType: string,
) => {
    if (!response.body) {
        const blob = await response.blob();
        onProgress(blob.size || expectedBytes);
        return blob;
    }

    const reader = response.body.getReader();
    const chunks: ArrayBuffer[] = [];
    let receivedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const copy = new Uint8Array(value.byteLength);
        copy.set(value);
        chunks.push(copy.buffer);
        receivedBytes += value.byteLength;
        onProgress(receivedBytes);
    }

    return new Blob(chunks, {
        type: response.headers.get('content-type') || defaultContentType,
    });
};

const loadAsset = async ({
    source,
    expectedBytes,
    cache,
    forceNetwork = false,
    onProgress,
}: LoadConcertAudioAssetOptions, defaultContentType: string, assetLabel: string): Promise<ConcertAudioAssetResult> => {
    let lastError: unknown = new Error(`${assetLabel} download failed`);

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const cachedResponse = cache && !forceNetwork
                ? await cache.get(source).catch(() => undefined)
                : undefined;
            const response = cachedResponse ?? await fetch(source, {
                cache: forceNetwork || attempt > 0 ? 'reload' : 'force-cache',
            });
            if (!response.ok) throw new Error(`${assetLabel} request failed with ${response.status}`);

            const cacheWrite = !cachedResponse && cache
                ? cache.put(source, response.clone()).catch(() => undefined)
                : Promise.resolve();
            const blob = await readResponse(response, expectedBytes, onProgress, defaultContentType);
            await cacheWrite;
            return { blob, origin: cachedResponse ? 'cache' : 'network' };
        } catch (error) {
            lastError = error;
            onProgress(0);
            if (attempt === 0) await wait(350);
        }
    }

    throw lastError;
};

export const loadConcertAudioAsset = (options: LoadConcertAudioAssetOptions) => loadAsset(options, 'audio/mp4', 'Audio');
export const loadConcertProgrammeMediaAsset = (options: LoadConcertAudioAssetOptions) => loadAsset(options, 'video/mp4', 'Media');

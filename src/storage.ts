import { Tweet } from "./extract";

type Impression = {
    tweetId: string;
    timestamp: Date;
}

export function createDb(): Promise<IDBDatabase> {

    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("TweetDatabase", 3);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains("tweets")) {
                db.deleteObjectStore("tweets");
                console.log("Tweets store deleted");
            }
            if (db.objectStoreNames.contains("impressions")) {
                db.deleteObjectStore("impressions");
                console.log("Impressions store deleted");
            }

            if (!db.objectStoreNames.contains("tweets")) {
                db.createObjectStore("tweets", { keyPath: "id" });
                console.log("Object store created");
            }

            if (!db.objectStoreNames.contains("impressions")) {
                const impressionsStore = db.createObjectStore("impressions", { autoIncrement: true });
                impressionsStore.createIndex("timestamp", "timestamp", { unique: false });
                console.log("Impressions store created");
            }
        };
        request.onsuccess = (event) => {
            console.log("IndexedDB opened successfully");
            resolve((event.target as IDBOpenDBRequest).result);
        };
        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            reject(event);
        };
    });
}

export async function saveTweetToIndexedDB(db: IDBDatabase, tweet: Tweet, viewDate: Date): Promise<void> {
    const transaction = db.transaction(["tweets", "impressions"], "readwrite");
    const tweetsObjectStore = transaction.objectStore("tweets");
    const impressionsObjectStore = transaction.objectStore("impressions");

    const tweetRequest = tweetsObjectStore.put(tweet);
    const impressionRequest = impressionsObjectStore.add({ tweetId: tweet.id, timestamp: viewDate });

    tweetRequest.onsuccess = (event) => {
        console.log("Tweet saved to IndexedDB successfully");
    };

    tweetRequest.onerror = (event) => {
        console.error("Error saving tweet to IndexedDB:", event);
    };

    impressionRequest.onsuccess = (event) => {
        console.log("Impression saved to IndexedDB successfully");
    };

    impressionRequest.onerror = (event) => {
        console.error("Error saving impression to IndexedDB:", event);
    };

    // Count the number of tweets in the database
    const countTransaction = db.transaction(["tweets"], "readonly");
    const countObjectStore = countTransaction.objectStore("tweets");
    const countRequest = countObjectStore.count();

    countRequest.onsuccess = () => {
        console.log(`Total number of tweets in the database: ${countRequest.result}`);
    };

    countRequest.onerror = (event) => {
        console.error("Error counting tweets:", event);
    };

    return Promise.all([requestToPromise(tweetRequest), requestToPromise(impressionRequest)]).then(() => { });
}

export function getViewsInRange(db: IDBDatabase, start: Date, end: Date): Promise<Tweet[]> {
    const transaction = db.transaction(["impressions"], "readonly");
    const impressionsObjectStore = transaction.objectStore("impressions");

    const range = IDBKeyRange.bound(start, end);
    const request: IDBRequest<Impression[]> = impressionsObjectStore.index("timestamp").getAll(range);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            const tweetIds = request.result;
            const tweetRequests: IDBRequest<Tweet>[] = tweetIds.map((impression) => {
                const tweetTransaction = db.transaction(["tweets"], "readonly");
                const tweetObjectStore = tweetTransaction.objectStore("tweets");
                return tweetObjectStore.get(impression.tweetId);
            });

            allRequestsToPromises(tweetRequests)
                .then(tweets => tweets.reverse())
                .then(resolve)
                .catch(reject);
        };

        request.onerror = (event) => {
            console.error("Error getting impressions:", event);
            reject(event);
        };
    });
}

function allRequestsToPromises<T>(requests: IDBRequest<T>[]): Promise<T[]> {
    return Promise.all(requests.map(req => requestToPromise(req)));
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((res, rej) => {
        request.onsuccess = () => res(request.result);
        request.onerror = rej;
    });
}
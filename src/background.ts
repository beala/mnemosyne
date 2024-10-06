import { Tweet } from './extract';

// Open (or create) the IndexedDB database
let db: IDBDatabase;
const dbName = 'TweetDatabase';
const dbVersion = 1;

const request = indexedDB.open(dbName, dbVersion);

request.onerror = (event) => {
  console.error("IndexedDB error:", event);
};

request.onsuccess = (event) => {
  db = (event.target as IDBOpenDBRequest).result;
  console.log("IndexedDB opened successfully");
};

request.onupgradeneeded = (event) => {
  db = (event.target as IDBOpenDBRequest).result;
  db.createObjectStore("tweets", { keyPath: "id" });
  console.log("Object store created");
};

// Function to save tweet to IndexedDB
function saveTweetToIndexedDB(tweet: Tweet) {
  const transaction = db.transaction(["tweets"], "readwrite");
  const objectStore = transaction.objectStore("tweets");
  const request = objectStore.put(tweet);

  request.onerror = (event) => {
    console.error("Error saving tweet to IndexedDB:", event);
  };

  request.onsuccess = (event) => {
    console.log("Tweet saved to IndexedDB successfully");
  };
}

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === 'saveTweet') {
    const tweet = request.tweet as Tweet;
    console.log(`Viewed tweet:\n${JSON.stringify(tweet, null, 2)}`);
    saveTweetToIndexedDB(tweet);
  }
});
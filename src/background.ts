import { Tweet } from './extract';

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

function saveTweetToIndexedDB(tweet: Tweet) {
  const transaction = db.transaction(["tweets"], "readwrite");
  const objectStore = transaction.objectStore("tweets");
  const request = objectStore.put(tweet);
  request.onsuccess = (event) => {
    console.log("Tweet saved to IndexedDB successfully");
  };

  request.onerror = (event) => {
    console.error("Error saving tweet to IndexedDB:", event);
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
}

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === 'saveTweet') {
    const tweet = request.tweet as Tweet;
    console.log(`Viewed tweet:\n${JSON.stringify(tweet, null, 2)}`);
    if(tweet.id.trim().length > 0) {
      saveTweetToIndexedDB(tweet);
    } else {
      console.log("Tweet has no ID. Probably an ad. Skipping save.");
    }
  }
});
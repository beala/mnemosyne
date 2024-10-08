import { Tweet } from './extract';
import { createDb, saveTweetToIndexedDB } from './storage';

createDb().then((db) => {
  chrome.runtime.onMessage.addListener(async (request: any) => {
    if (request.action === 'saveTweet') {
      const tweet = request.tweet as Tweet;
      console.log(`Viewed tweet:\n${JSON.stringify(tweet, null, 2)}`);
      if (tweet.id.trim().length > 0) {
        await saveTweetToIndexedDB(db, tweet, new Date());
      } else {
        console.log("Tweet has no ID. Probably an ad. Skipping save.");
      }
    }
  })
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("query.html")
  });
});
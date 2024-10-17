import { DAYS_TO_KEEP_DEFAULT } from './constants';
import { Tweet } from './extract';
import { PriorityQueue } from './priorityq';
import { createDb, purgeTweetsOlderThan, saveTweetToIndexedDB } from './storage';

const deduplicator = new PriorityQueue<string>();

function removeOldIds(deduplicator: PriorityQueue<string>, olderThan: Date) {
  while (!deduplicator.isEmpty()) {
    const tweetId = deduplicator.dequeueLowestPriority();
    if (tweetId) {
      const [negativeImpressionTime, id] = tweetId;
      const impressionTime = new Date(-negativeImpressionTime);
      if (impressionTime > olderThan) {
        deduplicator.enqueue(id, -impressionTime.getTime());
        return;
      }
      console.log(`Removing old tweet ID: ${id} with impression time: ${impressionTime} which was ${(new Date().getTime() - impressionTime.getTime()) / 1000} seconds ago`);
    }
  }
}

createDb().then((db) => {
  chrome.runtime.onMessage.addListener(async (request: any) => {
    if (request.action === 'saveTweet') {
      const tweet = request.tweet as Tweet;
      console.log(`Viewed tweet:\n${JSON.stringify(tweet, null, 2)}`);
      removeOldIds(deduplicator, new Date(new Date().getTime() - (60 * 1000)));
      if (tweet.id.trim().length > 0) {
        if (!deduplicator.contains(tweet.id)) {
          const impressionTime = new Date();
          deduplicator.enqueue(tweet.id, -impressionTime.getTime());
          await saveTweetToIndexedDB(db, tweet, impressionTime);
          chrome.storage.sync.get("daysToKeep", (result) => {
            const daysToKeep = result.daysToKeep || DAYS_TO_KEEP_DEFAULT;
            console.log(`Purging tweets older than ${daysToKeep} days`);
            purgeTweetsOlderThan(db, new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000));
          });
        } else {
          console.log(`Tweet ${tweet.id} was already saved less than 60 seconds ago. Skipping.`);
        }
      } else {
        console.log("Tweet has no ID. Skipping.");
      }
    }
  })
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("query.html")
  });
});
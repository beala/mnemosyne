import "fake-indexeddb/auto";
import { Tweet } from "../extract";
import { createDb, getViewsInRange, purgeTweetsOlderThan, saveTweetToIndexedDB } from "../storage";

let db: IDBDatabase;

beforeAll(async () => {
    db = await createDb();
});

// it("should save and retrieve a tweet from the database", async () => {
//     const tweet: Tweet = {
//         id: "1",
//         text: "Test tweet",
//         author: "Test Author",
//         displayName: "Test Display Name",
//         qt: null,
//         datetime: new Date().toISOString(),
//         imageUrls: ["Test Image URL"],
//         cardUrl: "Test Card URL"
//     };

//     const viewDate = new Date();
//     await saveTweetToIndexedDB(db, tweet, viewDate);

//     const retrievedTweet = await getViewsInRange(db, new Date(0), new Date());
//     expect(retrievedTweet).toEqual([[viewDate, tweet]]);
// });

it("should add tweet and delete it when older than 15 days", async () => {
    const tweet: Tweet = {
        id: "1",
        text: "Test tweet",
        author: "Test Author",
        displayName: "Test Display Name",
        qt: null,
        datetime: new Date().toISOString(),
        imageUrls: ["Test Image URL"],
        cardUrl: "Test Card URL"
    };

    const viewDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await saveTweetToIndexedDB(db, tweet, viewDate);

    const retrievedTweet = await getViewsInRange(db, new Date(0), new Date());
    expect(retrievedTweet).toEqual([[viewDate, tweet]]);

    await purgeTweetsOlderThan(db, new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));

    const retrievedTweet2 = await getViewsInRange(db, new Date(0), new Date());
    expect(retrievedTweet2).toEqual([]);

    // Add two impressions for the same tweet. One is not older than 15 days, so the tweet should not be deleted.
    const now = new Date();
    await saveTweetToIndexedDB(db, tweet, now);
    await saveTweetToIndexedDB(db, tweet, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    await purgeTweetsOlderThan(db, new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));
    
    const retrievedTweet3 = await getViewsInRange(db, new Date(0), new Date());
    expect(retrievedTweet3).toEqual([[now, tweet]]);
});


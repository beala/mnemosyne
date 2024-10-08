import "fake-indexeddb/auto";
import { Tweet } from "../extract";
import { createDb, getViewsInRange, saveTweetToIndexedDB } from "../storage";

let db: IDBDatabase;

beforeAll(async () => {
    db = await createDb();
});

it("should save and retrieve a tweet from the database", async () => {
    const tweet: Tweet = {
        id: "1",
        text: "Test tweet",
        author: "Test Author",
        displayName: "Test Display Name",
        qt: null,
        datetime: new Date(),
        imageUrls: ["Test Image URL"],
    };

    await saveTweetToIndexedDB(db, tweet, new Date());

    const retrievedTweet = await getViewsInRange(db, new Date(0), new Date());
    expect(retrievedTweet).toEqual([tweet]);
});
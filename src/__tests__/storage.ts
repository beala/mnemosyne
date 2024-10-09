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
        datetime: new Date().toISOString(),
        imageUrls: ["Test Image URL"],
        cardUrl: "Test Card URL"
    };

    const viewDate = new Date();
    await saveTweetToIndexedDB(db, tweet, viewDate);

    const retrievedTweet = await getViewsInRange(db, new Date(0), new Date());
    expect(retrievedTweet).toEqual([[viewDate, tweet]]);
});
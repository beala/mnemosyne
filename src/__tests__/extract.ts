import fs from 'fs';
import path from 'path';
import { extractTweet } from '../extract';
import { JSDOM } from 'jsdom';

const dataDir = path.join(__dirname, 'data');

test('extracts tweet from basic tweet', () => {
    const htmlContent = fs.readFileSync(path.join(dataDir, 'tweet.html'), 'utf-8');
    const dom = new JSDOM(htmlContent);
    const tweet = extractTweet(dom.window.document.body);

    expect(tweet).toBeDefined();
    expect(tweet.id).toEqual('1841842569182929401');
    expect(tweet.text).toEqual("I gotta get my act together you guys");
    expect(tweet.author).toEqual('jarvis_best');
    expect(tweet.datetime).toEqual("2024-10-03T14:07:42.000Z");
    expect(tweet.qt).toBeNull();
});

test('extracts tweet from qt tweet', () => {
    const htmlContent = fs.readFileSync(path.join(dataDir, 'tweet_with_qt.html'), 'utf-8');
    const dom = new JSDOM(htmlContent);
    const tweet = extractTweet(dom.window.document.body);

    expect(tweet).toBeDefined();
    expect(tweet.id).toEqual('1841911481241370703');
    expect(tweet.text).toEqual("i legitimately cannot imagine why, as a highly intelligent young korean or chinese person, u would not try to move to the united states to start ur career and life");
    expect(tweet.author).toEqual('tenobrus');
    expect(tweet.datetime).toEqual("2024-10-03T18:41:32.000Z");

    expect(tweet.qt?.text).toEqual(
        "Chinese in USA: 5.2m (0.37% of China's 1.4B population)\n" +
        "\n" +
        "Koreans in USA: 2.0m (3.8% of Korea's 51M population)\n" +
        "\n" +
        "(Everything is from 2021)\n" +
        "\n" +
        "https://census.gov/newsroom/facts-for-features/2023/asian-american-pacific-islander.html…"
    );
    expect(tweet.qt?.author).toEqual("cedar_xr");
    expect(tweet.qt?.datetime).toEqual("2024-10-03T18:38:33.000Z");
});
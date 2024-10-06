export type Tweet = {
    id: string;
    text: string;
    author: string;
    qt: QuotedTweet | null;
    datetime: string;
}

// quoted tweets contain less information when scraped from the web UI
export type QuotedTweet = {
    text: string;
    author: string;
    datetime: string;
}

export function extractTweet(tweetElement: Element): Tweet {
    let tweetId: string = "";
    let tweetAuthor: string = "";

    const tweetTexts: NodeListOf<Element> = tweetElement.querySelectorAll('[data-testid="tweetText"]')

    const userNameElements: NodeListOf<Element> = tweetElement.querySelectorAll('[data-testid="User-Name"]');
    if (userNameElements.length > 0) {
        const linkElement: HTMLAnchorElement | null = userNameElements[0].querySelector('a[href*="/status/"]');
        if (linkElement) {
            const href: string = linkElement.getAttribute('href') || "";
            const parts: string[] = href.split('/');
            const username: string = parts[parts.length - 3];
            tweetId = parts[parts.length - 1] || "";
            tweetAuthor = username ? `${username}` : "";
        }
    }

    const postedDateTimes: string[] = Array.from(tweetElement.querySelectorAll('time')).map(e => e.getAttribute('datetime') || "");

    // This should probably use innerText, but that's not supported in JSDOM and breaks the tests.
    let qtTweet: QuotedTweet | null = null;
    if (tweetTexts.length > 1) {
        qtTweet = {
            text: tweetTexts[1].textContent?.trim() || "",
            author: userNameElements[1].textContent?.trim().split('·')[0].split('@')[1] || "",
            datetime: postedDateTimes[1]
        }
    }

    return {
        id: tweetId,
        text: tweetTexts[0].textContent?.trim() || "",
        author: tweetAuthor,
        qt: qtTweet,
        datetime: postedDateTimes[0]
    }
}
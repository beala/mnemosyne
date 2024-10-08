export type Tweet = {
    id: string;
    text: string;
    author: string;
    displayName: string;
    qt: QuotedTweet | null;
    datetime: Date;
    imageUrls: string[];
}

// quoted tweets contain less information when scraped from the web UI
export type QuotedTweet = {
    text: string;
    author: string;
    displayName: string;
    datetime: Date;
    imageUrls: string[];
}

export function extractTweet(tweetElement: Element): Tweet {
    let tweetId: string = "";
    let tweetAuthor: string = "";
    let displayName: string = "";

    const tweetTextElements: NodeListOf<Element> = tweetElement.querySelectorAll('[data-testid="tweetText"]')
    let mainTweetText: string = "";
    if (tweetTextElements.length > 0) {
        mainTweetText = tweetTextElements[0].textContent?.trim() || "";
    } else {
        console.error("ERROR: No Tweet-Text element found." /*, tweetElement.outerHTML*/);
    }

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

        const anchorElement: HTMLAnchorElement | null = userNameElements[0].querySelector('a');
        if (anchorElement) {
            displayName = anchorElement.textContent?.trim() || "";
        }
    } else {
        console.error("ERROR: No User-Name element found.", tweetElement.outerHTML);
    }

    const postedDateTimes: string[] = Array.from(tweetElement.querySelectorAll('time')).map(e => e.getAttribute('datetime') || "");

    const photoLinks: string[] = Array.from(tweetElement.querySelectorAll('a[href*="/photo/"]')).map(e => e.getAttribute('href') || "");

    const mainTweetPhotoLinks: string[] = photoLinks.filter(e => e.includes(tweetId));

    // This should probably use innerText, but that's not supported in JSDOM and breaks the tests.
    let qtTweet: QuotedTweet | null = null;
    if (tweetTextElements.length > 1) {
        qtTweet = {
            text: tweetTextElements[1].textContent?.trim() || "",
            author: userNameElements[1].textContent?.trim().split('·')[0].split('@')[1] || "",
            displayName: userNameElements[1].querySelector('div[dir="ltr"]')?.textContent?.trim() || "",
            datetime: new Date(postedDateTimes[1]),
            imageUrls: photoLinks.filter(e => !e.includes(tweetId))
        }
    }

    return {
        id: tweetId,
        text: mainTweetText,
        author: tweetAuthor,
        displayName: displayName,
        qt: qtTweet,
        datetime: new Date(postedDateTimes[0]),
        imageUrls: mainTweetPhotoLinks
    }
}
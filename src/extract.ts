export type Tweet = {
    id: string;
    text: string;
    author: string;
    displayName: string;
    qt: QuotedTweet | null;
    datetime: string;
    imageUrls: string[];
    cardUrl: string;
}

// quoted tweets contain less information when scraped from the web UI
export type QuotedTweet = {
    text: string;
    author: string;
    displayName: string;
    datetime: string;
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
    }

    let cardUrl: string = "";
    const cardElements: NodeListOf<Element> = tweetElement.querySelectorAll('[data-testid="card.wrapper"]');
    if (cardElements.length > 0) {
        cardUrl = cardElements[0].querySelector('a')?.getAttribute('href') || "";
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
    let mainPostedDateTime: string = "";
    let qtPostedDateTime: string = "";  
    if (postedDateTimes.length > 0) {
        mainPostedDateTime = new Date(postedDateTimes[0]).toISOString();
    }
    if (postedDateTimes.length > 1) {
        qtPostedDateTime = new Date(postedDateTimes[1]).toISOString();
    }

    const photoLinks: string[] = Array.from(tweetElement.querySelectorAll('a[href*="/photo/"]')).map(e => e.getAttribute('href') || "");

    const mainTweetPhotoLinks: string[] = photoLinks.filter(e => e.includes(tweetId));

    // This should probably use innerText, but that's not supported in JSDOM and breaks the tests.
    let qtTweet: QuotedTweet | null = null;
    if (tweetTextElements.length > 1) {
        qtTweet = {
            text: tweetTextElements[1].textContent?.trim() || "",
            author: userNameElements[1].textContent?.trim().split('·')[0].split('@')[1] || "",
            displayName: userNameElements[1].querySelector('div[dir="ltr"]')?.textContent?.trim() || "",
            datetime: qtPostedDateTime,
            imageUrls: photoLinks.filter(e => !e.includes(tweetId))
        }
    }

    // Fallback for viewing tweets on their own page (when you click through).
    if (tweetId.length === 0) {
        const linkElement: HTMLAnchorElement | null = tweetElement.querySelector('a[href*="/status/"]');
        if (linkElement) {
            const href: string = linkElement.getAttribute('href') || "";
            const parts: string[] = href.split('/');
            const username: string = parts[1];
            tweetId = parts[3] || "";
            tweetAuthor = username ? `${username}` : "";
        }
    }

    return {
        id: tweetId,
        text: mainTweetText,
        author: tweetAuthor,
        displayName: displayName,
        qt: qtTweet,
        datetime: mainPostedDateTime,
        imageUrls: mainTweetPhotoLinks,
        cardUrl: cardUrl
    }
}
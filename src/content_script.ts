import { extractTweet, Tweet } from "./extract";

type BackgroundAction = SaveTweetAction

type SaveTweetAction = {
  action: "saveTweet",
  tweet: Tweet
}

function saveTweet(tweetElement: Element): void {
  const tweet = extractTweet(tweetElement);
  const action: BackgroundAction = {
    action: 'saveTweet',
    tweet: tweet
  }

  chrome.runtime.sendMessage(action);
}

function observeTweets(): void {
  console.log('Starting tweet observer');
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach((mutation: MutationRecord) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node: Node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tweetElement: Element | null = element.querySelector('[data-testid="tweet"]');
            if (tweetElement) {
              saveTweet(tweetElement);
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

observeTweets();
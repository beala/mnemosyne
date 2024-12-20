import { extractTweet, Tweet } from "./extract";

type BackgroundAction = SaveTweetAction

type SaveTweetAction = {
  action: "saveTweet",
  tweet: Tweet
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const tweetElement = entry.target as Element;
      saveTweet(tweetElement);
      // Unobserve the tweet after saving it
      observer.unobserve(tweetElement);
    }
  });
}, {
  root: null,
  threshold: 0.5
});

function saveTweet(tweetElement: Element): void {
  let tweet: Tweet;
  try {
    tweet = extractTweet(tweetElement);
  } catch (error) {
    console.error("Error extracting tweet:", error);
    console.error("TweetElement:", JSON.stringify(tweetElement.outerHTML, null, 2));
    return;
  }
  
  const action: BackgroundAction = {
    action: 'saveTweet',
    tweet: tweet
  }

  chrome.runtime.sendMessage(action);
}

function observeTweets(): void {
  console.log('Starting tweet observer');
  const mutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach((mutation: MutationRecord) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node: Node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tweetElement: Element | null = element.querySelector('[data-testid="tweet"]');
            if (tweetElement) {
              // Observe the tweet element with the Intersection Observer
              observer.observe(tweetElement);
            }
          }
        });
      }
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

observeTweets();
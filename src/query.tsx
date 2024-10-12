import React, { useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Tweet } from "./extract";
import { createDb, getViewsInRange } from "./storage";
import './styles/main.css';
import lunr from 'lunr';

function formatDate(date: Date): string {

    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'short', // "Mon"
        year: 'numeric', // "2023"
        month: 'short',   // "Oct"
        day: 'numeric'   // "24"
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    };

    const formattedDate = new Date(date).toLocaleDateString('en-US', dateOptions);
    const formattedTime = new Date(date).toLocaleTimeString('en-US', timeOptions);

    return `${formattedDate} at ${formattedTime}`;
}

function formatImpression(impressionTime: Date): string {
    const diff = new Date().getTime() - impressionTime.getTime()
    const diffInSeconds = Math.floor(diff / 1000)
    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`
    } else if (diffInSeconds < 3600) {
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        return `${diffInMinutes} minutes ago`
    } else if (diffInSeconds < 86400) {
        const diffInHours = Math.floor(diffInSeconds / 3600)
        return `${diffInHours} hours ago`
    } else {
        return formatDate(impressionTime)
    }
}

enum SearchRange {
    LAST_15_MINUTES = "15min",
    LAST_24_HOURS = "1day",
    LAST_7_DAYS = "1week",
    ALL_TIME = "all"
}

const Timeline = () => {
    const [tweets, setTweets] = useState<Map<string, { impressionDate: Date, tweet: Tweet }>>(new Map())
    const [searcher, setSearcher] = useState<lunr.Index | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [displayedTweets, setDisplayedTweets] = useState<{ impressionDate: Date, tweet: Tweet }[]>([])

    const [searchRange, setSearchRange] = useState<SearchRange>(SearchRange.LAST_15_MINUTES)
    const [startTime, setStartTime] = useState<Date>(new Date(new Date().getTime() - 15 * 60 * 1000))
    const [endTime, setEndTime] = useState<Date>(new Date())

    useEffect(() => {
        console.log("Creating db")
        createDb().then(newDb => {
            console.time('getViewsInRange');
            getViewsInRange(newDb, startTime, endTime).then(impressions => {
                const tweetsWithImpressionDate = impressions.map(([impressionDate, tweet]) => ({ impressionDate, tweet }));

                const newTweetsMap = new Map(tweetsWithImpressionDate.map(tweet => [tweet.tweet.id, tweet]))
                setTweets(newTweetsMap)
                console.time('Search index creation');
                const newSearcher = lunr(function () {
                    this.ref('id')
                    this.field('text')
                    this.field('author')
                    this.field('displayName')
                    this.field('qt.text')
                    this.field('qt.author')
                    this.field('qt.displayName')

                    tweetsWithImpressionDate.forEach((tweet) => {
                        this.add(tweet.tweet)
                    })
                })
                // const newSearcher = new FuzzySearch(tweetsWithImpressionDate, ['tweet.text', 'tweet.author', 'tweet.displayName', 'tweet.qt.text', 'tweet.qt.author', 'tweet.qt.displayName'], { sort: true });
                console.timeEnd('Search index creation');
                console.log(`Created Search index with ${tweetsWithImpressionDate.length} tweets`);

                setSearcher(newSearcher)
                setDisplayedTweets(newSearcher.search(searchTerm).map(result => {
                    return newTweetsMap.get(result.ref)!;
                }))
            })
            console.timeEnd('getViewsInRange');
        });
    }, [startTime, endTime]);

    function exportTweets() {
        const jsonData = JSON.stringify(displayedTweets, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'exported_tweets.json';
        document.body.appendChild(link);
        link.click();
    }

    const debouncedSearch = useMemo(() => {
        const debounced = debounce((term: string) => {
            setSearchTerm(term)
            console.time('FuzzySearch search');
            setDisplayedTweets(searcher?.search(term).map(result => tweets.get(result.ref)!) ?? []);
            console.timeEnd('FuzzySearch search');
        }, 750);
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const newSearchTerm = e.target.value.toLowerCase();
            debounced(newSearchTerm);
        };
    }, [searcher]);

    function updateSearchRange(range: SearchRange) {
        let now = new Date();
        let startTime;
        switch (range) {
            case SearchRange.LAST_15_MINUTES:
                startTime = new Date(now.getTime() - 15 * 60 * 1000);
                break;
            case SearchRange.LAST_24_HOURS:
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case SearchRange.LAST_7_DAYS:
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case SearchRange.ALL_TIME:
                startTime = new Date(0);
        }
        setStartTime(startTime);
        setEndTime(now);
    }

    return (
        <div className="max-w-[700px] mx-auto">
            <div className="m-2 mx-auto">
                <input
                    type="text"
                    placeholder="Search tweets..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={debouncedSearch}
                />
            </div>
            <div className="m-2 mx-auto">
                <div className="flex items-center">
                    <select
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                        onChange={(e) => {
                            switch (e.target.value) {
                                case '15min':
                                    updateSearchRange(SearchRange.LAST_15_MINUTES);
                                    setSearchRange(SearchRange.LAST_15_MINUTES);
                                    break;
                                case '1day':
                                    updateSearchRange(SearchRange.LAST_24_HOURS);
                                    setSearchRange(SearchRange.LAST_24_HOURS);
                                    break;
                                case '1week':
                                    updateSearchRange(SearchRange.LAST_7_DAYS);
                                    setSearchRange(SearchRange.LAST_7_DAYS);
                                    break;
                                case 'all':
                                    updateSearchRange(SearchRange.ALL_TIME);
                                    setSearchRange(SearchRange.ALL_TIME);
                                    break;
                            }
                        }}
                    >
                        <option value="15min">Last 15 minutes</option>
                        <option value="1day">Last 24 hours</option>
                        <option value="1week">Last 7 days</option>
                        <option value="all">All time</option>
                    </select>
                </div>
                <div className="m-2 mx-auto space-x-1">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {
                            updateSearchRange(searchRange)
                        }}
                    >
                        Refresh
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={exportTweets}
                    >
                        Export
                    </button>
                </div>
            </div>
            <div className="max-w-[700px] mx-auto text-base">
                <ul>
                    {displayedTweets.map(({ impressionDate, tweet }) => (
                        <li className="mb-5 border-gray-200 pb-3 list-none" key={`${tweet.id}-${impressionDate.getTime()}`}>
                            <div onClick={() => window.open(`https://twitter.com/${tweet.author}/status/${tweet.id}`, '_blank')} className="cursor-pointer hover:bg-blue-50">
                                <div className="font-bold">{tweet.displayName} (@{tweet.author}) <span className="text-gray-500 text-sm font-normal">{formatDate(new Date(tweet.datetime))}</span></div>
                                <div>{tweet.text}</div>
                                {tweet.cardUrl && <div>🔗 <a href={tweet.cardUrl} target="_blank" className="text-blue-500 hover:text-blue-600">{tweet.cardUrl}</a></div>}
                                {tweet.imageUrls.length > 0 && <div>📷</div>}
                                {tweet.qt && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded">
                                        <div className="font-bold">{tweet.qt.displayName} (@{tweet.qt.author})</div>
                                        <div>{tweet.qt.text}</div>
                                        {tweet.qt.imageUrls.length > 0 && <div>📷</div>}
                                        <div className="text-gray-500">Posted {formatDate(new Date(tweet.qt.datetime))}</div>
                                    </div>
                                )}
                                <div className="text-gray-500 text-sm">Viewed {formatImpression(impressionDate)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Debounce utility function
function debounce<F extends (...args: any[]) => any>(func: F, delay: number): F {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: Parameters<F>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    } as F;
}

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Timeline />
    </React.StrictMode>
);

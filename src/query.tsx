import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tweet } from "./extract";
import { createDb, getViewsInRange } from "./storage";
import './styles/main.css';

async function getTweets(startDate: Date, endDate: Date, searchTerm: string): Promise<[Date, Tweet][]> {
    const db = await createDb()
    return getViewsInRange(db, startDate, endDate).then(views => {
        return views.filter(([impressionDate, tweet]) => tweet.text.toLowerCase().includes(searchTerm) ||
            tweet.author.toLowerCase().includes(searchTerm) ||
            tweet.displayName.toLowerCase().includes(searchTerm) ||
            (tweet.qt && (
                tweet.qt.text.toLowerCase().includes(searchTerm) ||
                tweet.qt.author.toLowerCase().includes(searchTerm) ||
                tweet.qt.displayName.toLowerCase().includes(searchTerm)
            ))
        );
    });
}

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

const Timeline = () => {
    const [tweets, setTweets] = useState<[Date, Tweet][]>([])
    const [startTime, setStartTime] = useState<Date>(new Date(new Date().getTime() - 15 * 60 * 1000))
    const [searchTerm, setSearchTerm] = useState<string>('')

    useEffect(() => {
        getTweets(new Date(new Date().getTime() - 15 * 60 * 1000), new Date(), searchTerm).then(tweets => {
            setTweets(tweets)
        })
    }, [])

    return (
        <div>
            <div className="m-4 max-w-[700px] mx-auto">
                <input
                    type="text"
                    placeholder="Search tweets..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                        const newSearchTerm = e.target.value.toLowerCase();
                        setSearchTerm(newSearchTerm);

                        const timeoutId = setTimeout(() => {
                            getTweets(startTime, new Date(), newSearchTerm).then(tweets => {
                                setTweets(tweets);
                            });
                        }, 1000);

                        return () => clearTimeout(timeoutId);
                    }}
                />
            </div>
            <div className="m-4 max-w-[700px] mx-auto">
                <div className="flex items-center">
                    <select
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                        onChange={(e) => {
                            const now = new Date();
                            let startDate;
                            switch (e.target.value) {
                                case '15min':
                                    startDate = new Date(now.getTime() - 15 * 60 * 1000);
                                    setStartTime(startDate);
                                    break;
                                case '1day':
                                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                                    setStartTime(startDate);
                                    break;
                                case '1week':
                                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                    setStartTime(startDate);
                                    break;
                                default:
                                    startDate = new Date(0); // Beginning of time for 'all'
                                    setStartTime(startDate);
                            }
                            getTweets(startDate, now, searchTerm).then(filteredTweets => {
                                setTweets(filteredTweets);
                            });
                        }}
                    >
                        <option value="15min">Last 15 minutes</option>
                        <option value="1day">Last 24 hours</option>
                        <option value="1week">Last 7 days</option>
                        <option value="all">All time</option>
                    </select>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {
                            const now = new Date();
                            getTweets(startTime, now, searchTerm).then(filteredTweets => {
                                setTweets(filteredTweets);
                            });
                        }}
                    >
                        Refresh
                    </button>
                </div>
            </div>
            <div className="max-w-[700px] mx-auto text-base ">
                <ul>
                    {tweets.map(tweetImpression => {
                        const [impressionTime, tweet] = tweetImpression
                        return (
                            <li className="mb-5 border-gray-200 pb-3 list-none">
                                <div onClick={() => window.open(`https://twitter.com/${tweet.author}/status/${tweet.id}`, '_blank')} className="cursor-pointer hover:bg-blue-50">
                                    <div className="font-bold">{tweet.displayName} (@{tweet.author}) <span className="text-gray-500 text-sm font-normal">{formatDate(tweet.datetime)}</span></div>
                                    <div>{tweet.text}</div>
                                    {tweet.imageUrls.length > 0 && <div>📷</div>}
                                    {tweet.qt && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded">
                                            <div className="font-bold">{tweet.qt.displayName} (@{tweet.qt.author})</div>
                                            <div>{tweet.qt.text}</div>
                                            {tweet.qt.imageUrls.length > 0 && <div>📷</div>}
                                            <div className="text-gray-500">Posted {formatDate(tweet.qt.datetime)}</div>
                                        </div>
                                    )}
                                    <div className="text-gray-500 text-sm">Viewed {formatImpression(impressionTime)}</div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Timeline />
    </React.StrictMode>
);

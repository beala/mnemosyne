import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Tweet } from "./extract";
import { createDb, getViewsInRange } from "./storage";
import './styles/main.css';

async function getTweets(): Promise<Tweet[]> {
    const db = await createDb()
    return getViewsInRange(db, new Date(0), new Date())
}

const Popup = () => {
    const [tweets, setTweets] = useState<Tweet[]>([])

    useEffect(() => {
        getTweets().then(tweets => {
            setTweets(tweets)
        })
    }, [])

    return (
        <>
            <ul className="min-w-[700px]">
                {tweets.map(tweet => (
                    <li className="mb-5 border-b border-gray-200 pb-3 list-none">
                        <div onClick={() => window.open(`https://twitter.com/${tweet.author}/status/${tweet.id}`, '_blank')} className="cursor-pointer">
                            <div className="font-bold">{tweet.displayName} (@{tweet.author})</div>
                            <div>{tweet.text}</div>
                            {tweet.imageUrls.length > 0 && <div>📷</div>}
                            <div className="text-gray-500 text-xs">{tweet.datetime.toLocaleString()}</div>
                            {tweet.qt && (
                                <div className="mt-3 p-3 bg-gray-50 rounded">
                                    <div className="font-bold">{tweet.qt.displayName} (@{tweet.qt.author})</div>
                                    <div>{tweet.qt.text}</div>
                                    {tweet.qt.imageUrls.length > 0 && <div>📷</div>}
                                    <div className="text-gray-500 text-xs">{tweet.qt.datetime.toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);

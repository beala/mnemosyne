import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import './styles/main.css';
import { DAYS_TO_KEEP_DEFAULT } from "./constants";


const Options = () => {
    const [daysToKeep, setDaysToKeep] = useState<number | undefined>(undefined);
    const [savedText, setSavedText] = useState<string>("");

    useEffect(() => {
        chrome.storage.sync.get("daysToKeep", (result) => {
            console.log(result);
            setDaysToKeep(result.daysToKeep || DAYS_TO_KEEP_DEFAULT);
        });
    }, []);

    return (
        <div className="max-w-[700px] mx-auto space-y-3 space-x-2">
            <h1 className="text-2xl font-bold">Mnemosyne Options</h1>
            Delete Tweets Older Than:
            <input
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={daysToKeep?.toString() || ""}
                onChange={(e) => {
                    console.log(`In onChange ${daysToKeep}`);
                    if (!isNaN(parseInt(e.target.value))) {
                        setDaysToKeep(parseInt(e.target.value));
                    } else {
                        setDaysToKeep(undefined);
                    }
                }}
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={() => {
                    chrome.storage.sync.set({ daysToKeep });
                    setSavedText("Saved");
                    setTimeout(() => {
                        setSavedText("");
                    }, 1000);
                }}
            >Save</button>
            {savedText}
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);

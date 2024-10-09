<img src="static/for_distinguished_user.png" alt="Withered wojak can't find the tweet" width="500" />

# Mnemosyne

Mnemosyne (neh-moss-eh-knee) is a browser extension that helps you remember and find tweets you've seen. Every tweet you view is saved and searchable. Simply install it, browser X/Twitter, and click the Mnemosyne icon in the toolbar to search your viewed tweets.

To access your viewed tweets, click the Mnemosyne icon in the toolbar.

<img src="static/toolbar.png" alt="Extension icon in toolbar" width="300" />

And you can search your viewed tweets:

<img src="static/query.png" alt="Search page" width="500" />

## Installation

This has not been published to the Chrome Web Store yet. 

Until then, you can load it into Chrome manually.

### Option 1: Download the latest release

1. Download the latest release from the [Releases](https://github.com/alexbeal/mnemosyne/releases) page.
2. Unzip the file.
3. Open Chrome (or any Chromium based browser) and navigate to `chrome://extensions`.
4. Enable "Developer mode" in the top right corner.
5. Click "Load unpacked."
6. Select the `mnemosyne` directory.

### Option 2: Build from source

1. Clone the repository.
2. Run `npm ci` to install the dependencies.
3. Run `npm run build` to build the extension.
4. Open Chrome (or any Chromium based browser) and navigate to `chrome://extensions`.
5. Enable "Developer mode" in the top right corner.
6. Click "Load unpacked."
7. Select the `dist` directory.

## Credits

- <a href="https://www.freepik.com/icons/scroll">Toolbar icon of a scroll by Freepik</a>
- Typescript extension scaffolding: https://github.com/chibat/chrome-extension-typescript-starter

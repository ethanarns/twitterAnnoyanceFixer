// ==UserScript==
// @name         Twitter Fixer
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Fix random crap on Twitter
// @author       You
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        none
// ==/UserScript==

const INTERVAL_TIME = 200;
const CHECKED_ATTR_KEY = "checkedbyscript";

// These elements contain everything, including replies
const getAllTweets = () => {
    const articles = document.querySelectorAll("[role=article]");
    return articles;
};

// Sees if it contains a span with the text starting with promoted
// May catch real tweet text that starts with "Promoted", but that's
// not a tweet you probably want to see anyway
const isPromoted = (articleElement) => {
    const spans = articleElement.querySelectorAll("span");
    for (let i = 0; i < spans.length; i++) {
        if (spans[i].innerText.startsWith("Promoted")) {
            return true;
        }
    }
    return false;
}

// Only gets the first, so excludes replies and retweets
const getMainTweetText = (articleElement) => {
    const textElements = articleElement.querySelectorAll("[lang]");
    if (textElements.length === 0) {
        return "No text found";
    } else {
        return textElements[0].innerText + "";
    }
};

const handleLikes = (article) => {
    const likeFind = article.querySelectorAll('[data-testid="like"],[data-testid="unlike"]');
    if (likeFind.length === 1) {
        const likeContainer = likeFind[0];
        const numberEl = likeContainer.querySelectorAll('[data-testid="app-text-transition-container"]');
        if (numberEl.length === 1) {
            //console.log(numberEl);
            numberEl[0].innerText = "";
        } if (numberEl.length === 0) {
            console.warn("No numbers found",article);
        } else {
            // Temporarily finds multiple for some reason
            console.debug("Multiple numbers found:",numberEl);
        }
    } else if (likeFind.length > 1) {
        console.error("Unsual number of like containers found in article",likeFind.length);
    } else {
        console.warn("likes container not found in:",article);
    }
}

// All the actual handling of each individual tweet is here
const handleHomeArticle = (article) => {
    // Only do this on the home list
    const mainTweetText = getMainTweetText(article);
    // Hide if promoted (aka an advertisement)
    if (isPromoted(article)) {
        article.innerHTML = '<p style="color: white;">Ad hidden: <span style="font-style: italic; opacity: 0.5;">' + mainTweetText + '</span></p>';
        return;
    }
    handleLikes(article);
};

const handleSoloTweetReactions = () => {
    const likeFind = document.querySelectorAll('[data-testid="like"],[data-testid="unlike"]');
    if (likeFind.length === 1) {
        const likeContainer = likeFind[0];
        const numberEl = likeContainer.querySelectorAll('[data-testid="app-text-transition-container"]');
        if (numberEl.length === 1) {
            //console.log(numberEl);
            numberEl[0].innerText = "";
        } else {
            console.warn("Like number not found");
        }
    } else if (likeFind.length > 1) {
        console.error("Unsual number of like containers found in article",likeFind.length);
    } else {
        console.debug("likes container not found");
    }
}

const hideTrends = () => {
    const trendsAttempt = document.querySelectorAll('[aria-label="Timeline: Trending now"]');
    if (trendsAttempt.length === 1) {
        const trendsEl = trendsAttempt[0];
        trendsEl.style.display = "none";
    } else if (trendsAttempt.length === 0) {
        console.debug("No trends panel found",trendsAttempt);
    } else {
        console.error("Multiple trends panels found:",trendsAttempt);
    }
}

// Main
(function() {
    'use strict';
    window.setInterval(() => {
        // If on home scroller
        if (window.location.href.includes("home")) {
            const articles = getAllTweets();
            for (let articleIndex = 0; articleIndex < articles.length; articleIndex++) {
                const article = articles[articleIndex];
                // This usually returns null when nothing is applied, which triggers a true return with !
                if (!article.getAttribute(CHECKED_ATTR_KEY)) {
                    article.setAttribute(CHECKED_ATTR_KEY,"true");
                    handleHomeArticle(article);
                }
            }
        } else if (window.location.href.includes("i/timeline")) {
            handleSoloTweetReactions();
        }

        hideTrends();
    },INTERVAL_TIME);
})();



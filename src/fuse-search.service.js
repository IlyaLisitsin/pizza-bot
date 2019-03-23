const Fuse = require('fuse.js');

const options = {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: [
        "title"
    ]
};

const FuseSearchService = (streetsCollection, userInput) => {
    const fuse = new Fuse(Object.values(streetsCollection), options);
    const resultWithIDs = fuse.search(userInput);
    return resultWithIDs
};

module.exports = FuseSearchService;
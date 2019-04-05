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
    const distinctResult = Array.from(new Set(resultWithIDs.map(el => el.id))).map(id => ({ id, title: resultWithIDs.find(el => el.id === id).title }));
    return distinctResult
};

module.exports = FuseSearchService;
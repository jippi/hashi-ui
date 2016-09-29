import React from 'react';

const collectMeta = function(metaBag, dtWithClass = 'default', sort = true) {
    let meta = [];
    let metaTag = '<none>';

    let keys = Object.keys(metaBag || {});

    if (sort) {
        keys = keys.sort();
    }

    keys.forEach(function(key) {
        meta.push(<dt className={dtWithClass} key={key + 'dt'}>{key}</dt>);
        meta.push(<dd key={key + 'dd'}>{metaBag[key]}</dd>);
    });

    if (meta.length > 0) {
        metaTag = <dl className="dl-horizontal">{meta}</dl>
    }

    return metaTag
}

export {
    collectMeta
}

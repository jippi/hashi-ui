import React from 'react';

const collectMeta = function(metaBag, dtWithClass = 'default') {
    let meta = [];
    let metaTag = '<none>';

    Object.keys(metaBag || {}).sort().forEach(function(key) {
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

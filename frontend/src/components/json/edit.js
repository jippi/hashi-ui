import React, { Component, PropTypes } from 'react';
import JsonEdit from 'react-json';

const deleteNullProperties = (json) => {
    return Object.keys(json).reduce((acc, key) => {
        if (typeof json[key] === 'object' && json[key] !== null)
            return {...acc, [key]: deleteNullProperties(json[key])};
        if (json[key] === null)
            return {...acc, [key]: ''};
        return {...acc, [key]: json[key]};
    }, {})
};

const setNullProperties = (json) => {
    return Object.keys(json).reduce((acc, key) => {
        if (typeof json[key] === 'object' && json[key] !== null)
            return {...acc, [key]: deleteNullProperties(json[key])};
        if (json[key] === '' && key !== 'User')
            return {...acc, [key]: null};
        return {...acc, [key]: json[key]};
    }, {})
};

const format = (json, path) => {
    const paths = path.split('.');
    const [lastValue] = paths.reverse();
    return Object.keys(json).reduce((acc, key) => {
        if (key === lastValue) return {...acc, [key]: 'changed'};
        if(typeof json[key] === 'object')
            return {...acc, [key]: format(json[key])}
        return {...acc, [key]: json[key]}
    }, {});
};

const getChildrenSettings = (json) => {
    return Object.keys(json).reduce((acc, key) => {
        if(typeof json[key] === 'object' && json[key] !== null)
            return {
                ...acc,
                [key]: {
                    fields: getChildrenSettings(json[key]),
                    settings: {
                        fixedFields: Object.keys(json[key])
                    }
                }
            }
        return acc;
    }, {});
};

const generateSettings = (json) => ({
    adder: false,
    fixedFields: Object.keys(json),
    fields: getChildrenSettings(json)
});

const Json = (props) => {
    const {json, onChange} = props;
    const testOnChange = (json) => onChange(setNullProperties(json));
    return (
        <JsonEdit value={deleteNullProperties(json)}
                  onChange={testOnChange}
                  settings={generateSettings(json)} />
    );
}

Json.propTypes = {
    json: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Json;

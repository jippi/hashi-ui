import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip'
import uuid from 'node-uuid'

class MetaDisplay extends Component {

    render() {
        const metaBag = this.props.metaBag;
        const dtWithClass = this.props.dtWithClass;
        const sortKeys = this.props.sortKeys;
        const asTooltip = this.props.asTooltip;

        let keys = Object.keys(metaBag || {});
        if (keys.length === 0) {
            return (<span>-</span>);
        }

        let identifier = uuid.v1();
        let meta = [];
        let metaTag = null;

        if (sortKeys) {
            keys = keys.sort();
        }

        keys.forEach(function(key) {
            meta.push(<dt className={dtWithClass} key={key + 'dt'}>{key}</dt>);
            meta.push(<dd key={key + 'dd'}>{metaBag[key]}</dd>);
        });

        if (meta.length > 0) {
            metaTag = <dl className="dl-horizontal dl-tooltip">{meta}</dl>
        }

        if (asTooltip) {
            return (
                <div>
                    <ReactTooltip id={'tooltip-' + identifier}>{metaTag}</ReactTooltip>
                    <span data-tip data-for={'tooltip-' + identifier} className="dotted">{keys.length} keys</span>
                </div>
            )
        }

        return metaTag
    }

}

MetaDisplay.defaultProps = {
    metaBag: {},
    dtWithClass: "default",
    sortKeys: true,
    asTooltip: false
};

export default MetaDisplay

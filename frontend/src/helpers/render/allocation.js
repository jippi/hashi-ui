import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Glyphicon } from 'react-bootstrap';

const clientStatusTextColor = {
    xcomplete: 'text-success',
    xrunning: 'text-info',
    xlost: 'text-warning',
    xfailed: 'text-danger',
};

const clientStatusIcon = {
    complete: <Glyphicon glyph="ok" />,
    running: <Glyphicon glyph="cog" />,
    lost: <Glyphicon glyph="remove" />,
    failed: <Glyphicon glyph="exclamation-sign" />,
};

export function renderDesiredStatus(allocation) {
    if (allocation.DesiredDescription) {
        return (
          <div>
            <ReactTooltip id={ `tooltip-${allocation.ID}` }>{allocation.DesiredDescription}</ReactTooltip>
            <span data-tip data-for={ `tooltip-${allocation.ID}` } className="dotted">
              {allocation.DesiredStatus}
            </span>
          </div>
        );
    }

    return <div>{allocation.DesiredStatus}</div>;
}

export function renderClientStatus(allocation) {
    let textColor = null;
    let icon = null;

    if (allocation.ClientStatus in clientStatusTextColor) {
        textColor = clientStatusTextColor[allocation.ClientStatus];
    }

    if (allocation.ClientStatus in clientStatusIcon) {
        icon = clientStatusIcon[allocation.ClientStatus];
    }

    return <span className={ textColor }>{icon} {allocation.ClientStatus}</span>;
}

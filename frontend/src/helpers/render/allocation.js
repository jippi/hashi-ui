import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Glyphicon } from 'react-bootstrap';

const clientStatusIcon = {
    complete: <span><Glyphicon glyph="stop" /></span>,
    running: <span className="text-success"><Glyphicon glyph="play" /></span>,
    lost: <span className="text-danger"><Glyphicon glyph="remove" /></span>,
    failed: <span className="text-danger"><Glyphicon glyph="exclamation-sign" /></span>,
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
    let icon = null;

    if (allocation.ClientStatus in clientStatusIcon) {
        icon = clientStatusIcon[allocation.ClientStatus];
    }

    return (
      <div>
        <ReactTooltip id={ `client-status-${allocation.ID}` }>{allocation.ClientStatus}</ReactTooltip>
        <span data-tip data-for={ `client-status-${allocation.ID}` }>{icon}</span>
      </div>
    );
}

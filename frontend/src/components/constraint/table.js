import React, { Component, PropTypes } from 'react';
import ReactTooltip from 'react-tooltip';
import ConstraintRow from './row';

class ConstraintTable extends Component {

    render() {
        function getUniqueKeyForConstraint(constraint) {
            return (`${constraint.LTarget}@${constraint.RTarget}@${constraint.Operand}`);
        }

        if (this.props.constraints === null || this.props.constraints.length === 0) {
            return <span>-</span>;
        }

        const table = (
          <table className={ `table table-hover ${this.props.asTooltip ? '' : 'table-striped'}` }>
            <thead>
              <tr>
                <th>Key</th>
                <th>Operand</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              { this.props.constraints.map(constraint =>
                <ConstraintRow
                  key={ getUniqueKeyForConstraint(constraint) }
                  idPrefix={ this.props.idPrefix }
                  constraint={ constraint }
                />
              )}
            </tbody>
          </table>
        );

        if (this.props.asTooltip) {
            return (
              <div>
                <ReactTooltip id={ `tooltip-constraints-${this.props.idPrefix}` }>{ table }</ReactTooltip>
                <span data-tip data-for={ `tooltip-constraints-${this.props.idPrefix}` } className="dotted">
                  { this.props.constraints.length } constraints
                </span>
              </div>
            );
        }

        return table;
    }
}

ConstraintTable.defaultProps = {
    constraints: [],
    asTooltip: false,
    idPrefix: null,
};

ConstraintTable.propTypes = {
    constraints: PropTypes.array,
    idPrefix: PropTypes.string,
    asTooltip: PropTypes.bool.isRequired,
};

export default ConstraintTable;

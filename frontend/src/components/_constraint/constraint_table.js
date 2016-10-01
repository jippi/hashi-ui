import React, { Component } from 'react';
import ConstraintRow from './constraint_row';
import ReactTooltip from 'react-tooltip'

class ConstraintTable extends Component {

    getUniqueKeyForConstraint(constraint) {
        return (constraint.LTarget + '@' + constraint.RTarget + '@' + constraint.Operand)
    }

    render() {
        if (this.props.constraints === null || this.props.constraints.length === 0) {
            return (<span>-</span>)
        }

        const table = (
            <table className={'table table-hover ' + (this.props.asTooltip ? '' : 'table-striped')}>
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Operand</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {this.props.constraints.map((constraint) => {
                    return (<ConstraintRow key={this.getUniqueKeyForConstraint(constraint)} idPrefix={this.props.idPrefix} constraint={constraint} />)
                })}
            </tbody>
            </table>
        )

        if (this.props.asTooltip) {
            return (
                <div>
                    <ReactTooltip id={'tooltip-constraints-' + this.props.idPrefix}>{table}</ReactTooltip>
                    <span data-tip data-for={'tooltip-constraints-' + this.props.idPrefix} className="dotted">{this.props.constraints.length} constraints</span>
                </div>
            )
        }

        return table
    }
}

ConstraintTable.defaultProps = {
    constraints: [],
    asTooltip: false,
    idPrefix: null,
};

export default ConstraintTable

import React, { Component } from 'react';
import Chart from 'chart.js';

class Doughnut extends Component {

    componentDidMount () {
        let chartCanvas = this.refs.chart;

        let myChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: this.props.data,
            options: {
                legend: {
                    display: false
                }
            }
        });

        this.setState({chart: myChart});
    }

    componentDidUpdate () {
        let chart = this.state.chart;
        let data = this.props.data;

        data.datasets.forEach((dataset, i) => { chart.data.datasets[i].data = dataset.data })

        chart.data.labels = data.labels;
        chart.update();
    }

    render () {
        return (
            <div className="card">
                <div className="header">
                    <h4 className="title">{ this.props.title }</h4>
                </div>
                <div className="content">
                    <div id="chartPreferences" className="ct-chart ct-perfect-fourth">
                        <canvas ref={'chart'} ></canvas>
                    </div>
                    <div className="footer">
                        <div className="legend">
                            <div><i className="fa fa-circle text-info" /> { this.props.data.labels[0] } </div>
                            <div><i className="fa fa-circle text-warning" /> { this.props.data.labels[1] } </div>
                            <div><i className="fa fa-circle text-danger" /> { this.props.data.labels[2] } </div>
                        </div>
                        <hr />
                        <div className="stats">
                            <i className="fa fa-clock-o" /> Last updated:
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Doughnut;

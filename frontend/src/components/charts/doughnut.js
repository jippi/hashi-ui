import React, { Component, PropTypes } from 'react';
import Chart from 'chart.js';
import { Badge } from 'react-bootstrap';

class Doughnut extends Component {

    componentDidMount() {
        const chartCanvas = this.chart;
        const myChart = new Chart(chartCanvas, {
            type: 'doughnut',
            data: this.props.data,
            options: {
                legend: {
                    display: false,
                },
            },
        });

        // TODO: fix below ignore
        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState({ chart: myChart });
    }

    componentDidUpdate() {
        const chart = this.state.chart;
        const data = this.props.data;

        data.datasets.forEach((dataset, i) => { chart.data.datasets[i].data = dataset.data; });

        chart.data.labels = data.labels;
        chart.update();
    }

    render() {
        let extra = <br />;
        if (this.props.data.labels[3]) {
            extra = (
              <div>
                <i className="fa fa-circle text-danger" />
                { this.props.data.labels[3] }
                <Badge>
                  {this.props.data.datasets[0].data[3]}
                </Badge>
              </div>
            );
        }

        return (
          <div className="card">
            <div className="header">
              <h4 className="title">{ this.props.title }</h4>
            </div>
            <div className="content">
              <div id="chartPreferences" className="ct-chart ct-perfect-fourth">
                <canvas ref={ (c) => { this.chart = c; } } ></canvas>
              </div>
              <div className="footer">
                <div className="legend">
                  <div>
                    <i className="fa fa-circle text-info" />
                    { this.props.data.labels[0] }
                    <Badge>
                      { this.props.data.datasets[0].data[0] }
                    </Badge>
                  </div>
                  <div>
                    <i className="fa fa-circle text-warning" />
                    { this.props.data.labels[1] }
                    <Badge>
                      { this.props.data.datasets[0].data[1] }
                    </Badge>
                  </div>
                  <div>
                    <i className="fa fa-circle text-danger" />
                    { this.props.data.labels[2] }
                    <Badge>
                      { this.props.data.datasets[0].data[2] }
                    </Badge>
                  </div>
                  {extra}
                </div>
              </div>
            </div>
          </div>
        );
    }
}

Doughnut.propTypes = {
    data: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
};

export default Doughnut;

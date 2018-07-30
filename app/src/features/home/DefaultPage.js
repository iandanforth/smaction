import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import * as actions from './redux/actions';
import Tooltip from 'rc-tooltip';
import Slider, { Handle } from 'rc-slider';
import { sum, min } from 'lodash';
import 'rc-slider/assets/index.css';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export class DefaultPage extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const actionValues = [22.1, 150.0, -33.5, 0.01, 19.2];
    const temperature = 100;
    const trace = this.getTrace(
      actionValues,
      temperature
    );

    const initialRev = 1;
    const layout = this.getLayout(initialRev);

    this.state = {
      data: [trace],
      layout: layout,
      frames: [],
      config: {},
      revision: initialRev,
      actionValues: actionValues,
      temperature
    };


    this.updateTooltip = this.updateTooltip.bind(this);
    this.handleYSliderChange = this.handleYSliderChange.bind(this);
    this.handleTSliderChange = this.handleTSliderChange.bind(this);
    this.getLayout = this.getLayout.bind(this);
  }

  makePositive(vals) {
    const minVal = min(vals);
    if (minVal >= 0) {
      return vals
    }
    const offset = Math.abs(minVal);
    let newVals = [];
    for (let i=0; i<vals.length; i++){
      const val = vals[i];
      newVals.push(val + offset);
    }
    return newVals;
  }

  getTrace(actionValues, temperature) {
    let xVals = []
    let yVals = []

    let tempYVals = [];
    for (let i=0; i<actionValues.length; i++){
      const val = actionValues[i];
      tempYVals.push(Math.exp(val / temperature));
      xVals.push(ALPHABET[i] + ': ' + val);
    }

    const tempSum = sum(tempYVals);
    for (let i=0; i<tempYVals.length; i++){
      const tempVal = tempYVals[i];
      yVals.push(tempVal / tempSum);
    }

    return { 
      x: xVals, 
      y: yVals,
      type: 'bar', 
      marker: { 
        color: 'orange' },
      }
  }

  getLayout(rev) {
    const layout = { 
      width: 640, 
      height: 480, 
      title: 'Softmax Action Selection Probabilities',
      datarevision: rev,
      xaxis: {
        categoryorder: "category ascending",
        type: "category",
        title: "Action name and value in an example state."
      },
      yaxis: {
        title: "Probability"
      }
    }
    return layout;
  }

  updateTooltip(sliderProps) {
    const { value, dragging, index, ...restProps } = sliderProps;
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    );
  };

  handleTSliderChange(newTemperature) {
    let { actionValues, revision } = this.state;
    const newRev = revision + 1
    const trace = this.getTrace(actionValues, newTemperature);
    const layout = this.getLayout(newRev)
    this.setState({
      data: [trace],
      layout: layout,
      revision: newRev,
      temperature: newTemperature
    });
  }

  handleYSliderChange(val) {
    let { actionValues, temperature, revision } = this.state;
    actionValues[0] = val;
    const newRev = revision + 1
    const trace = this.getTrace(actionValues, temperature);
    const layout = this.getLayout(newRev)
    this.setState({
      data: [trace],
      layout: layout,
      revision: newRev,
      actionValues
    });
  }

  render() {
    const wrapperStyle = { width: 600, margin: "auto" };
    return (
      <div className="home-default-page">
        <div className="app-intro">
          <Plot
            data={this.state.data}
            layout={this.state.layout}
            frames={this.state.frames}
            config={this.state.config}
            revision={this.state.revision}
            onInitialized={figure => this.setState(figure)}
            onUpdate={figure => this.setState(figure)}
          />
          <div style={wrapperStyle}>
            <p>Change the softmax temperature</p>
            <Slider 
              min={1} 
              max={2000}
              step={1}
              defaultValue={100}
              handle={this.updateTooltip} 
              onChange={this.handleTSliderChange}
            />
            <p>Change the value of State-Action pair 'a'</p>
            <Slider 
              min={0} 
              max={200}
              step={1}
              defaultValue={100}
              handle={this.updateTooltip} 
              onChange={this.handleYSliderChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    home: state.home,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DefaultPage);

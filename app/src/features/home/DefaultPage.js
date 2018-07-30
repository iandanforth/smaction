import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Plot from 'react-plotly.js';
import * as actions from './redux/actions';
import Tooltip from 'rc-tooltip';
import Slider, { Handle } from 'rc-slider';
import 'rc-slider/assets/index.css';


export class DefaultPage extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const trace = this.getTrace(
      [1, 2, 3],
      [2, 5, 3]
    );

    const layout = this.getLayout(1);

    this.state = {
      data: [trace],
      layout: { width: 640, height: 480, title: 'A Fancy Plot' },
      frames: [],
      config: {},
      revision: 1
    };


    this.updateTooltip = this.updateTooltip.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.getLayout = this.getLayout.bind(this);
  }

  getTrace(xs, ys) {
     return { 
      x: xs, 
      y: ys,
      type: 'bar', 
      marker: { 
        color: 'orange' },
    }
  }

  getLayout(rev) {
    const layout = { 
      width: 640, 
      height: 480, 
      title: 'A Fancy Plot',
      datarevision: rev
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

  handleSliderChange(val) {
    console.log(this.state.data);
    let { x, y } = this.state.data[0];
    y[0] = val;
    const newRev = this.state.revision + 1
    const trace = this.getTrace(x, y);
    const layout = this.getLayout(newRev)
    this.setState({
      data: [trace],
      layout: layout,
      revision: newRev
    });
  }

  render() {
    const wrapperStyle = { width: 400, margin: 50 };

    console.log(this.state)

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
            <p>Slider with custom handle</p>
            <Slider 
              min={0} 
              max={20}
              defaultValue={3}
              handle={this.updateTooltip} 
              onChange={this.handleSliderChange}
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

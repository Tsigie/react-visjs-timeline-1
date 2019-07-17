import vis from 'vis/dist/vis-timeline-graph2d.min'
import 'vis/dist/vis-timeline-graph2d.min.css'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import difference from 'lodash/difference'
import intersection from 'lodash/intersection'
import each from 'lodash/each'
import assign from 'lodash/assign'
import omit from 'lodash/omit'
import keys from 'lodash/keys'
import DatePicker from 'material-ui/DatePicker';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlatButton from 'material-ui/FlatButton';

const noop = function () { }
const events = [
  'currentTimeTick',
  'click',
  'contextmenu',
  'doubleClick',
  'groupDragged',
  'changed',
  'rangechange',
  'rangechanged',
  'select',
  'timechange',
  'timechanged',
  'mouseOver',
  'mouseMove',
  'itemover',
  'itemout',
]

const eventPropTypes = {}
const eventDefaultProps = {}
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
each(events, event => {
  ; (eventPropTypes[event] = PropTypes.func),
    (eventDefaultProps[`${event}Handler`] = noop)
})


export default class Timeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customTimes: [],
      startDate: "2015-08-15",
      endDate: "2018-08-02"
    };
  }

  componentWillUnmount() {
    this.$el.destroy()
  }

  componentDidMount() {
    const { container } = this.refs

    this.$el = new vis.Timeline(container, undefined, this.props.options)

    events.forEach(event => {
      this.$el.on(event, this.props[`${event}Handler`])
    })

    this.init()
  }

  componentDidUpdate() {
    this.init()
  }

  shouldComponentUpdate(nextProps) {
    const { items, groups, options, selection, customTimes } = this.props

    const itemsChange = items !== nextProps.items
    const groupsChange = groups !== nextProps.groups
    const optionsChange = options !== nextProps.options
    const customTimesChange = customTimes !== nextProps.customTimes
    const selectionChange = selection !== nextProps.selection

    return (
      itemsChange ||
      groupsChange ||
      optionsChange ||
      customTimesChange ||
      selectionChange
    )
  }

  init() {
    const {
      items,
      groups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
      animate = true,
      currentTime,
    } = this.props

    let timelineOptions = options

    if (animate) {
      // If animate option is set, we should animate the timeline to any new
      // start/end values instead of jumping straight to them
      timelineOptions = omit(options, 'start', 'end')

      this.$el.setWindow(options.start, options.end, {
        animation: animate,
      })
    }

    this.$el.setOptions(timelineOptions)

    if (groups.length > 0) {
      const groupsDataset = new vis.DataSet()
      groupsDataset.add(groups)
      this.$el.setGroups(groupsDataset)
    }

    this.$el.setItems(items)
    this.$el.setSelection(selection, selectionOptions)

    if (currentTime) {
      this.$el.setCurrentTime(currentTime)
    }

    // diff the custom times to decipher new, removing, updating
    const customTimeKeysPrev = keys(this.state.customTimes)
    const customTimeKeysNew = keys(customTimes)
    const customTimeKeysToAdd = difference(
      customTimeKeysNew,
      customTimeKeysPrev
    )
    const customTimeKeysToRemove = difference(
      customTimeKeysPrev,
      customTimeKeysNew
    )
    const customTimeKeysToUpdate = intersection(
      customTimeKeysPrev,
      customTimeKeysNew
    )

    // NOTE this has to be in arrow function so context of `this` is based on
    // this.$el and not `each`
    each(customTimeKeysToRemove, id => this.$el.removeCustomTime(id))
    each(customTimeKeysToAdd, id => {
      const datetime = customTimes[id]
      this.$el.addCustomTime(datetime, id)
    })
    each(customTimeKeysToUpdate, id => {
      const datetime = customTimes[id]
      this.$el.setCustomTime(datetime, id)
    })

    // store new customTimes in state for future diff
    this.setState({ customTimes })
  }

  startDate(e, date) {
    date = this.formateDatePickerDate(date);
    this.setState({
      ...this.state,
      startDate: date
    }, () => {
      this.$el.setWindow(new Date(this.state.startDate), new Date(this.state.endDate), {
        animation: true,
      })
    });
  }

  endDate(e, date) {
    date = this.formateDatePickerDate(date);
    this.setState({
      ...this.state,
      endDate: date
    }, () => {
      this.$el.setWindow(new Date(this.state.startDate), new Date(this.state.endDate), {
        animation: true,
      })
    });
  }

  formateDatePickerDate = (dateFromDatepicker) => {
    if (!dateFromDatepicker) {
      return new Date();
    }
    const date = new Date(dateFromDatepicker);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString();
    const formatedMonth = (month.length === 1) ? (`0${month}`) : month;
    const day = date.getDate().toString();
    const formatedDay = (day.length === 1) ? (`0${day}`) : day;
    const hour = date.getHours().toString();
    const formatedHour = (hour.length === 1) ? (`0${hour}`) : hour;
    const minute = date.getMinutes().toString();
    const formatedMinute = (minute.length === 1) ? (`0${minute}`) : minute;
    const second = date.getSeconds().toString();
    const formatedSecond = (second.length === 1) ? (`0${second}`) : second;
    return `${year}-${formatedMonth}-${formatedDay}`;
  };

  zoomIn(e) {
    this.$el.zoomIn(0.35, "linear");
  }

  zoomOut(e) {
    this.$el.zoomOut(0.35, "linear");
  }

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <div>
            <DatePicker floatingLabelText="Start Date" name="startDate" onChange={this.startDate.bind(this)} />
            <DatePicker floatingLabelText="End Date" name="endDate" onChange={this.endDate.bind(this)} />
          </div>
          <br/>          
          <div>
            <FlatButton label="Zoom In" primary={true} name="zoomIn" value="+" onClick={this.zoomIn.bind(this)} />
            <FlatButton label="Zoom Out" primary={true} name="zoomOut" value="-" onClick={this.zoomOut.bind(this)} />
          </div>
          <br/>          
          <br/>          
        </MuiThemeProvider>
        <div ref="container" />
      </div>
    )
  }
}

Timeline.propTypes = assign(
  {
    items: PropTypes.array,
    groups: PropTypes.array,
    options: PropTypes.object,
    selection: PropTypes.array,
    customTimes: PropTypes.shape({
      datetime: PropTypes.instanceOf(Date),
      id: PropTypes.string,
    }),
    animate: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    currentTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.number,
    ]),
  },
  eventPropTypes
)

Timeline.defaultProps = assign(
  {
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {},
  },
  eventDefaultProps
)
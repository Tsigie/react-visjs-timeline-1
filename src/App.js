import React from 'react';
import './App.css';
import Timeline from './timeline';

class App extends React.Component {

  constructor() {
    super();
  }

 
  render() {
    const options = {
      height: '300px',
      stack: true,
      stackSubgroups: true,
      showMajorLabels: true,
      showCurrentTime: true,
      zoomMin: 1000000,
      showTooltips: true,
      format: {
        minorLabels: {
          minute: 'h:mma',
          hour: 'ha'
        }
      },
      tooltip: {
        followMouse: true,
        overflowMethod: 'flip'
      }
    };

    const items = [
      {id: 1, content: 'Item 1', start: '2016-01-01', end: '2016-01-02',
        title: 'Normal text'},
      {id: 2, content: 'Item 2', start: '2016-01-02', title: '<b>Bold</b>', end: ''},
      {id: 3, content: 'Item 3', start: '2016-01-03', type: 'point', end: '',
        title: '<span style="color: red">Red</span> text'},
      {id: 4, content: '<h1>HTML</h1> Item', start: '2016-01-03', end: '2016-01-04',
        title: '<table border="1"><tr><td>Cell 1</td><td>Cell 2</td></tr></table>'}
    ];
  

    const timeline =  <Timeline options={options} items={items}
    clickHandler={clickHandler}
    rangechangeHandler={rangeChangeHandler} />;

    return (
      <div className="App">
        <div>Zoomin, zoomout + datepicker goes here
        </div>
       {timeline}
      </div>
    );

    function clickHandler(props) {
      console.log("clicked");
    }


    function rangeChangeHandler(props) {
      // handle range change
    }
  }
}

export default App;

import { Component, useState } from './mini-react/react'
import ReactDOM from './mini-react/react-dom.js'
import './index.css'

class ClassComponent extends Component {
  constructor(props) {
    super(props)
    this.state = { count: 1 }
  }

  addCount = () => {
    this.setState({
      count: this.state.count + 1,
    })
  }

  render() {
    return (
      <div className="class-component">
        <div>this is a class Component</div>
        <div>prop value is: {this.props.value}</div>
        <div>count is: {this.state.count}</div>
        <input type="button" value="add count" onClick={this.addCount} />
      </div>
    )
  }
}

function FunctionComponent(props) {
  const [count, setCount] = useState(0)
  const addCount = () => {
    setCount(count + 1)
  }
  return (
    <div className="function-component">
      <div>this is a function Component</div>
      <div>prop value is: {props.value}</div>
      <div>count is: {count}</div>
      <input type="button" value="add count" onClick={addCount} />
    </div>
  )
}

const jsx = (
  <div className="deep1-box">
    <ClassComponent value={666} />
    <FunctionComponent value={100} />
    <div className="deep2-box-1">
      <a href="https://github.com/zh-lx/mini-react">mini react link</a>
      <p style={{ color: 'red', backgroundColor: 'yellow' }}> this is a red p</p>
      <div className="deep3-box">
        {true && <div>condition true</div>}
        {false && <div>condition false</div>}
        <input
          type="button"
          value="say hello"
          onClick={() => {
            alert('hello');
          }}
        />
      </div>
    </div>
    <div className="deep2-box-2">
      {Array.from({ length: 3 }).map((i, index) => (
        <li key={index}>item{index + 1}</li>
      ))}
    </div>
  </div>
);

ReactDOM.render(jsx, document.getElementById('root'))
import {ToyReact, Component} from './ToyReact';

class Square extends Component{
  render(){
    return <button className="square" onClick={() => { this.setState({value: this.props.value})}}>{this.state.value}</button>;
  }
}


class Board extends Component {
  renderSquare(i) {
    return (
      <Square
        value={i}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(1)}
          {this.renderSquare(2)}
          {this.renderSquare(3)}
        </div>
        <div className="board-row">
          {this.renderSquare(4)}
          {this.renderSquare(5)}
          {this.renderSquare(6)}
        </div>
        <div className="board-row">
          {this.renderSquare(7)}
          {this.renderSquare(8)}
          {this.renderSquare(9)}
        </div>
      </div>
    );
  }
}


ToyReact.renderDom(<Board />, document.body);
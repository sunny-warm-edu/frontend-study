import {ToyReact, Component} from './ToyReact';

class MyComponent extends Component{
  render(){
    console.log('this.props:', this.props);
    return (
      <div className="main">
        hello world
      </div>
    )
  }
}

let myComponent = 
  <MyComponent onClick={()=>{console.log('haha')}} count={3}>
  </MyComponent>

ToyReact.renderDom(myComponent, document.body);
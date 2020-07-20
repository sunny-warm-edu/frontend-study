//require('./ToyReact.js');
import {ToyReact, Component} from './ToyReact';

console.log('main.js');

class MyComponent extends Component{
  render(){
    // return <div>myComponent</div>
    return <div>
      <span>hello</span>
      <span>world</span>
      <div>
        {true}
        {this.children}
      </div>
    </div>
  }
}

// let myComponent = 
//   <div name="div1">
//     <span>hello</span>
//     <span>, world</span>
//   </div>

let myComponent = 
  <MyComponent name="a">
    123 ,
    <span>myComponent child 1 ,
      <span>inner span</span>
    </span>
  </MyComponent>
  
console.log(' --- before ToyReact.renderDom # myComponent:', myComponent);
ToyReact.renderDom(myComponent, document.body);

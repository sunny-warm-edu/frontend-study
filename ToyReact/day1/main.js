import {ToyReact, Component} from './ToyReact';

class Component1 extends Component{
  render(){
    return <button>Component1</button>;
  }
}

class Component2 extends Component{
  render(){
    return <div>
      Component2 :
      {this.children}
    </div>;
  }
}

class MyComponent extends Component{
  render(){
    return (
      <div name="div1" id="div1">
        <Component2>
          <span>
            click:
            <Component1/>
          </span>
        </Component2>

        hello world
        
        <span>,,span1</span>
        {this.children}
        <span>
          ,,span2 
          <span> ,, inner span ,, </span>
        </span>
      </div>
    )
  }
}

let myComponent = 
  <div>outter div : 
    <MyComponent>
      <a href="#">link</a> ,, 
      click1: <button>button</button>
      click2: <Component1/>
    </MyComponent>
  </div>

console.log(' --- before ToyReact.renderDom # myComponent:', myComponent);
ToyReact.renderDom(myComponent, document.body);
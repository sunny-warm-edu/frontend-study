//ElementWrapper TextWrapper的意义、作用？
class ElementWrapper {
  constructor(type){
    this.root = document.createElement(type);
  }

  setAttribute(name, value){
    this.root.setAttribute(name, value)
  }

  appendChild(vchild){
    //this.root.appendChild(vchild)
    vchild.mountTo(this.root)
  }

  mountTo(parent){
    parent.appendChild(this.root)
  }
}

class TextWrapper{
  constructor(content){
    this.root = document.createTextNode(content);
  }

  mountTo(parent){
    parent.appendChild(this.root)
  }
}

//Component的意义、作用？
export class Component{
  constructor(){
    this.children = [];
  }

  setAttribute(name, value){
    this[name] = value;
  }

  mountTo(parent){
    let vdom = this.render();
    console.log('Component.mountTo # vdom, parent:', vdom, parent)
    vdom.mountTo(parent);
  }

  appendChild(vchild) {
    this.children.push(vchild)
  }
}

export let ToyReact = {
  //createElement在哪些场景下会被调用？
  createElement(type, attributes, ...children){
    console.log('@@@ToyReact.createElement # type, attributes, children:', type, attributes, children);

    let element;
    if(typeof type === "string"){
      element = new ElementWrapper(type);
    } else {
      element = new type;
    }
    
    for(let name in attributes){
      element.setAttribute(name, attributes[name]);
    }

    // for(let child in children){
    //   if(typeof child === 'string'){
    //     child = new TextWrapper(child);
    //   }

    //   element.appendChild(child);
    // }

    let insertChildren = children => {
      for(let child of children){
        if(typeof child === 'object' && 
          child instanceof Array){
            insertChildren(child);
        } else {
          if( !(child instanceof Component)
            && !(child instanceof ElementWrapper)
            && !(child instanceof TextWrapper))
            child = String(child);

          if( typeof child === "string")
            child = new TextWrapper(child);

          element.appendChild(child)

          console.log('@@@ToyReact.createElement : appendChild # element,child:', element, child);
        }
      }
    }

    insertChildren(children);

    return element;
  },

  //renderDom在什么场景下被调用？为什么这么设计？
  renderDom(vdom, element){
    console.log('ToyReact.renderDom # vdom:', vdom);
    vdom.mountTo(element);
  }
}
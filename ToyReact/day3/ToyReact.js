class Node{
  appendChild(){}
  mountTo(){}
}

class Wrapper extends Node {
  mountTo(parent){
    this.root && typeof parent.appendChild === 'function' && parent.appendChild(this.root);
  }
}

//ElementWrapper TextWrapper的意义、作用？统一原生html标签对应的dom类element和自定义组件类的方法接口
//为什么用extends并且未调用super()时，construtor中_this为undefinded？用extends时，编译出_this的作用是什么？
class ElementWrapper extends Wrapper{
  constructor(type){
    super();
    this.root = document.createElement(type);
  }
  setAttribute(name, value){
    this.root && this.root.setAttribute && this.root.setAttribute(name, value);
  }
  appendChild(vchild){
    this.root && vchild && vchild.mountTo && vchild.mountTo(this.root)
  }
}
class TextWrapper extends Wrapper{
  constructor(content){
    super();
    this.root = document.createTextNode(content);
  }
}

//Component的意义、作用？自定义组件继承使用，封装render和其他生命周期函数
export class Component extends Node{
  constructor(){
    super();
    this.children = [];//把自定义组件包裹的虚实dom节点记录在this.children中，留给render()中处理（ToyReact使用方也可以选择不处理children，或者在任意需要的html节点位置插入children）
    this.props = {};
  }

  appendChild(child){
    this.children.push(child);
  }

  //注意自定义组件和原生dom的setAttribute的区别：自定义组件的setAttribute是设置props（react中组件的数据状态的一种概念），原生dom的setAttribute是设置dom节点的属性；这两个完全是两种东西
  setProp(name, value){
    this.props[name] = value;
  }

  mountTo(parent){
    const vdom = this.render();
    vdom.mountTo(parent)
  }
}

export let ToyReact = {

  //createElement在哪些场景下会被调用？
  /*
    在解析jsx的原生html标签时，由babel-loader的"@babel/plugin-transform-react-jsx"插件，根据虚实dom节点（html标签写法<>）的个数，多次调用createElement
    并且是先把内层html标签的相关信息（type、属性name等、包括text node的children等）作为参数，传入createElement的调用中，
    后根据外层标签来调用createElement
  */
  createElement(type, attributes, ...children){
    let element;
    if(typeof type === 'string'){
      //原生Dom节点的创建
      element = new ElementWrapper(type);

      //attribute的设置
      for(let attrName in attributes){
        if(attrName === 'className'){
          attrName = 'class';
        }
        element.setAttribute(attrName, attributes[attrName]);
      }
    } else {
      //自定义组件（只是class组件，尚未实现函数组件）
      element = new type;

      //props的设置
      for(let attrName in attributes){
        element.setProp(attrName, attributes[attrName]);
      }
    }
    
    //children的处理
    let insertChildren = children => {
      for(let child of children){
        if(typeof child === 'object' && child instanceof Array){ //递归处理自定义组件包裹的children
          insertChildren(child);
        } else {
          if(child === null || child === undefined){
            child = '';
          }

          if( !(child instanceof Node) )//非自定义组件、非textNode、非原生dom的其他类型变量，则当作textNode处理
            child = String(child);
          if( typeof child === "string")
            child = new TextWrapper(child);

          element.appendChild(child)
        }
      }
    }

    insertChildren(children);

    return element;
  },

  //renderDom在什么场景下被调用？为什么这么设计？
  renderDom(vdom, element){
    vdom.mountTo(element);
  }
}
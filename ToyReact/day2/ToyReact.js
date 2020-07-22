class Node{
  appendChild(){}
  mountTo(){}
}

class Wrapper extends Node {
  mountTo(range){
    //parent.appendChild(this.root);
    range.insertNode(this.root);
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
    if(name.match(/^on([\s\S]+)$/)){
      const eventName = RegExp.$1.replace(/^[\s\S]/, firstChar => firstChar.toLowerCase());
      this.root.addEventListener(eventName, value);
    } else {
      if(name === 'className'){
        name = 'class';
      }
      this.root.setAttribute(name, value);
    }
  }
  appendChild(vchild){
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);
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
    this.state = {};
  }

  appendChild(child){
    this.children.push(child);
  }

  //注意自定义组件和原生dom的setAttribute的区别：自定义组件的setAttribute是设置props（react中组件的数据状态的一种概念），原生dom的setAttribute是设置dom节点的属性；这两个完全是两种东西
  setProp(name, value){
    this.props[name] = value;
  }

  mountTo(range) {
    this.range = range;
    this.update();
  }

  update() {
    let placeholder = document.createComment("placholder");
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);
    this.range.deleteContents();
    let vdom = this.render();
    vdom.mountTo(this.range);
  }

  setState(state){
    if(Object.keys(state).length < 1){
      return;
    }

    const merge = (obj1, obj2) => {
      for(let key in obj2){
        if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object'){
          merge(obj1[key], obj2[key])
        } else {
          obj1[key] = obj2[key];
        }
      }
    }
    merge(this.state, state);

    this.update();
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
          if(child === null || child === void 0){
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
  renderDom(vdom, element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }

    vdom.mountTo(range);
  },
}
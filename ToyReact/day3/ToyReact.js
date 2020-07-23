class Node{
  appendChild(){}
  mountTo(){}
}

class Wrapper extends Node {
  mountTo(range){
    range.deleteContents();
    range.insertNode(this.root);
    this.range = range;
  }
}

class ElementWrapper extends Wrapper{
  constructor(type){
    super();
    //this.root = document.createElement(type);
    this.type = type;
    this.props = Object.create(null);
    this.children = [];
  }
  setAttribute(name, value){
    this.props[name] = value;
  }

  appendChild(vchild){
    this.children.push(vchild);
  }

  mountTo(range){
    range.deleteContents();
    let element = document.createElement(this.type);

    for(let name in this.props){
      const value = this.props[name];
      if(name.match(/^on([\s\S]+)$/)){
        const eventName = RegExp.$1.replace(/^[\s\S]/, firstChar => firstChar.toLowerCase());
        element.addEventListener(eventName, value);
      } else {
        if(name === 'className'){
          name = 'class';
        }
        element.setAttribute(name, value);
      }
    }

    for(let child of this.children){
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }
    
    range.insertNode(element);

    this.range = range;
  }
}
class TextWrapper extends Wrapper{
  constructor(content){
    super();
    this.root = document.createTextNode(content);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }
}

export class Component extends Node{
  constructor(){
    super();
    this.children = [];//把自定义组件包裹的虚实dom节点记录在this.children中，留给render()中处理（ToyReact使用方也可以选择不处理children，或者在任意需要的html节点位置插入children）
    this.props = Object.create(null);
    this.state = Object.create(null);
  }

  get type(){
    return this.constructor.name;
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
    let vdom = this.render();

    if(this.vdom){
      const isSameNode = (node1, node2) => {
        if(node1 === node2) return true;
        if(!node1 || !node2) return false;

        if(node1.type !== node2.type) return false;
        if(Object.keys(node1.props).length !== Object.keys(node2.props).length)
          return false;
        for(let name in node1.props){
          if(typeof node1.props[name] === 'function'
            && typeof node2.props[name] === 'function'
            && node1.props[name].toString() === node2.props[name].toString())
            continue;
          // if(typeof node1.props[name] === 'object'
          //   && typeof node2.props[name] === 'object'
          //   && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name]))
          //   continue;

          if(node1.props[name] !== node2.props[name])
            return false;
        }

        return true;
      }
      const isSameTree = (node1, node2) => {
        if(!isSameNode(node1, node2)) return false;
        if(node1.children.length !== node2.children.length)
          return false;
        for(let i = 0; i < node1.children.length; i ++){
          if(!isSameTree(node1.children[i], node2.children[i]))
            return false;
        }
        return true;
      }
      const replace = (newTree, oldTree) => {
        if(isSameTree(newTree, oldTree))
          return;
        if(!isSameNode(newTree, oldTree)){
          newTree.mountTo(oldTree.range);
        } else {
          for(let i = 0; i < newTree.children.length; i ++){
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      }

      replace(vdom, this.vdom);
    } else {
      vdom.mountTo(this.range);
    }
    
    this.vdom = vdom;
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
      element = new ElementWrapper(type);

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
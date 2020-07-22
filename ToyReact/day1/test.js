class Base {

}

class Class1 extends Base {

}

const base1 = new Base;

const class1 = new Class1;

console.log(base1 instanceof Base);
console.log(class1 instanceof Class1);
console.log(class1 instanceof Base);

console.log(class1 instanceof Object);
console.log(class1 instanceof String);

function f1(){

}

console.log(typeof f1);

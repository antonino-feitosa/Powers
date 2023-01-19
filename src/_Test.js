
class A{
    myName(){
        return 'a';
    }
}

class B extends A{
    myName(){
        return 'b' + super.myName();
    }
}

console.log(new B().myName());
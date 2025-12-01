
import React from "react";

class Counter extends React.Component{
  constructor(props){
        super(props);
        this.state={count:5}   
        
        this.HandleDecrement=this.HandleDecrement.bind(this)
  }
    HandleDecrement() {
    this.setState((curState)=>{
      if(curState.count<=0) return {count:curState.count}
          return {count:curState.count-1}  
     })   
  }

  HandleIncrement=()=>{
     this.setState((curState)=>{
      
          return {count:curState.count+1}
     })
  }
       render(){
        const date= new Date("Nov 28 2025");
        date.setDate(date.getDate()+this.state.count)
        return <div>
          <button onClick={this.HandleDecrement}>-</button>
          <span>{date.toDateString()}[{this.state.count}]</span>
          <button onClick={this.HandleIncrement}>+</button>
        </div>
       }
}

export default Counter;
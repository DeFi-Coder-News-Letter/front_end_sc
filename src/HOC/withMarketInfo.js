import React, { Component } from 'react';

// import { toDoubleThousands, findNetwork, formatBigNumber } from './../util';


export function withMarketInfo(Header) {
  return class extends Component {
    constructor(props) {
      super(props);

      this.state = {}
    }


    componentDidMount = () => { }


    componentWillUnmount() { }


    render() {

      const marketInfo = {}

      return <Header {...marketInfo} />
    }
  }
}

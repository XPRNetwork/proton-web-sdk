import React from "react";
import { RecoilRoot } from 'recoil';
import { Header } from "./components/Header";
import { Transfer } from "./components/Transfer";

class App extends React.Component {
  render() {
    return (
      <RecoilRoot>
        <Header/>
        <Transfer/>
      </RecoilRoot>
    );
  }
}

export default App;

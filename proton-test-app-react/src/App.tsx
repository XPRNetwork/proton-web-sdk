import React from 'react';
import logo from './assets/logo.svg';
import { session, login } from './webSdk';

class App extends React.Component {
  constructor(props: any) {
    super(props);
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          
          {!session && <button onClick={() => login()}>Login</button>}
        </header>
      </div>
    );
  }
}

export default App;

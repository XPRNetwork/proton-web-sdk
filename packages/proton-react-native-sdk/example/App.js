/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 *
 * adapted from App.js generated by the following command:
 *
 * react-native init example
 *
 * https://github.com/facebook/react-native
 */

import React, {Component} from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';

import ProtonRNSDK from '@proton/react-native-sdk';

class ProtonSDK {
  chainId;
  endpoints;
  requestAccount;
  session;
  link;

  constructor() {
    this.chainId = '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd';
    this.endpoints = ['https://testnet.protonchain.com']; // Multiple for fault tolerance
    this.requestAccount = 'taskly'; // optional
    this.session = null;
    this.link = null;
  }

  login = async () => {
    const { session, link } = await ProtonRNSDK({
      linkOptions: { chainId: this.chainId, endpoints: this.endpoints },
      transportOptions: {
        requestAccount: this.requestAccount,
        getReturnUrl: () => 'example://main',
      },
    });
  
    this.link = link;
    this.session = session;

    console.log('Auth: ', this.session.auth)
  };

  transfer = async () => {
    if (!this.session) return

    return this.session.transact({
      transaction: {
        actions: [{
          account: 'eosio.token',
          name: 'transfer',
          authorization: [this.session.auth],
          data: {
            from: this.session.auth.actor,
            to: 'token.burn',
            quantity: '0.0001 XPR',
            memo: ''
          }
        }]
      }
    }, {
      broadcast: true
    })
  };

  logout = async () => {
    this.link = undefined;
    this.session = undefined;
  };
}

const sdk = new ProtonSDK()

export default class App extends Component {
  state = {
    auth: {},
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Proton SDK example</Text>
        <Text style={styles.instructions}>Auth: {JSON.stringify(this.state.auth)}</Text>

        {Object.keys(this.state.auth).length > 0
          ? <>
            <Button
              title="Transfer"
              onPress={async () => await sdk.transfer()}
            />

            <Button
              title="Logout"
              onPress={async () => {
                await sdk.logout()
                this.setState({
                  ...this.state,
                  auth: undefined,
                })
              }}
            />
          </>
          : <Button
              title="Login"
              onPress={async () => {
                await sdk.login()
                console.log(sdk.session)
                if (sdk.session) {
                  this.setState({
                    ...this.state,
                    auth: sdk.session.auth
                  })
                }
              }}
            />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

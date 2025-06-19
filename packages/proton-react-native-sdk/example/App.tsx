/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {sdk} from './webSdk';

const App = () => {
  const [auth, setAuth] = useState({});

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={styles.welcome}>Proton SDK example</Text>
          <Text style={styles.instructions}>Auth: {JSON.stringify(auth)}</Text>

          {Object.keys(auth).length > 0 ? (
            <>
              <Button
                title="Transfer"
                onPress={async () => await sdk.transfer()}
              />

              <Button
                title="Logout"
                onPress={async () => {
                  await sdk.logout();
                  setAuth({});
                }}
              />
            </>
          ) : (
            <Button
              title="Login"
              onPress={async () => {
                await sdk.login();
                console.log(sdk.session);
                if (sdk.session) {
                  setAuth(sdk.session.auth);
                }
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

export default App;

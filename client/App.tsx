import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider } from 'react-redux';
import MainView from './components/MainView';
import store from "./redux";
import { enableScreens } from "react-native-screens";

enableScreens();
export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <MainView />
    </Provider>
  );
}


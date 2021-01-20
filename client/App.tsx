import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider } from 'react-redux';
import MainView from './components/MainView';
import store from "./redux";

export default function App() {
  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <MainView />
    </Provider>
  );
}


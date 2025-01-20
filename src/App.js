import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './layouts/Layout';
import Lockscreen from './pages/Lockscreen';
function App() {
  



  return (
    <div className="App">

      <Provider store={store}>
         <Layout />
      </Provider>
    </div>
  );
}

export default App;

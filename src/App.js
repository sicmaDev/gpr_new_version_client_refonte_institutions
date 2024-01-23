import React from 'react';
// import logo from './logo.svg';
import './App.css';
import {Provider} from 'react-redux';
import store from './redux/store';
import Layout from './layouts/Layout';
function App() {
  React.useEffect(()=>{
    // const msg=firebase.messaging();
    // msg.requestPermission().then(()=>{
    //   return msg.getToken();
    // }).then((data)=>{
    //   console.warn("token",data)
    // })
  })

  return (
    <div className="App">
      <Provider store={store}>
         <Layout/>
      </Provider>
    </div>
  );
}

export default App;


import Navbar from './components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './components/Verifyemail';
import React, { useEffect, useState } from 'react';
import Home from './pages/Home';




function App() {
  

  const [isLogedIn, setisLogedIn] = useState(() => {
    return !!localStorage.getItem('token');
     
  });
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = tokenPayload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("token");
        setisLogedIn(false);
      } else {
        setisLogedIn(true);  // Make sure the user is logged in if token is not expired
      }
    } else {
      setisLogedIn(false); // If there's no token in localStorage, set the user as not logged in
    }
    
    
  }, []);


  return (
   <div>
    <Router>
      <Navbar isLoggedin ={isLogedIn} setIsLoggedIn={setisLogedIn}  ></Navbar>
     
      <Routes>
          <Route path="/" element={<Home isLoggedin={isLogedIn} setIsLoggedIn={setisLogedIn} />} />
          <Route path="/login" element={<Login isLoggedin ={isLogedIn} setIsLoggedIn={setisLogedIn}/>} />
          <Route path="/signup" element={<Signup></Signup>}></Route>
          <Route path="/verify-email" element={<VerifyEmail></VerifyEmail>}></Route>         

      </Routes>

  
    </Router>
   </div>
    
  )
}

export default App
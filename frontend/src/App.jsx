
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './components/Verifyemail';
import React, { useEffect, useState } from 'react';




function App() {
  

  const [isLogedIn, setisLogedIn] = useState(() => {
    return !!localStorage.getItem('Token');
     
  });
  useEffect(() => {
    const token = localStorage.getItem("Token");

    if (token) {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = tokenPayload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("Token");
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
            
          <Route path="/login" element={<Login isLoggedin ={isLogedIn} setIsLoggedIn={setisLogedIn}/>} />
          <Route path="/signup" element={<Signup></Signup>}></Route>

      </Routes>

  
    </Router>
   </div>
    
  )
}

export default App
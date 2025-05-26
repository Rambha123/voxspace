
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
 

  return (
   <div>
    <Router>
      <Navbar></Navbar>
     
      <Routes>
            
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="/signup" element={<Signup></Signup>}></Route>

      </Routes>

  
    </Router>
   </div>
    
  )
}

export default App
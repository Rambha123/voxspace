import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const location = useLocation();  // To access the URL query parameters
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search); // Get query parameters
    const token = query.get('token'); // Extract the token

    if (token) {
      // Make API request to verify the email
      axios.get(`http://localhost:6969/api/verify-email?token=${token}`)
        .then((response) => {
          setMessage(response.data.message);  // Show success message
          setTimeout(() => {
            navigate('/login');  // Redirect to login after successful verification
          },0);  // Redirect after 3 seconds
        })
        .catch((error) => {
          setMessage(error.response?.data?.message || 'Something went wrong');
        });
    }
  }, [location.search, navigate]);

  return (
    <div className="verify-email">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
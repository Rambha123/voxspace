import jwt from 'jsonwebtoken';

const prof = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     req.user = {
      id: decoded.id,
      name: decoded.name || 'Anonymous', // ✅ make sure name exists
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default prof;
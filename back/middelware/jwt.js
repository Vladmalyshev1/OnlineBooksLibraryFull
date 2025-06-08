const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyAccessToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ msg: 'No access token, authorization denied' });
    
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ msg: 'Access token is not valid' });
    }
};

const verifyRefreshToken = async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ msg: 'No refresh token' });
    
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      
      const user = await User.findByPk(decoded.id);
      if (!user || user.refreshToken !== token) {
        return res.status(403).json({ msg: 'Invalid refresh token' });
      }
      
      req.user = decoded;
      next();
    } catch (err) {
      res.status(403).json({ msg: 'Refresh token is not valid' });
    }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
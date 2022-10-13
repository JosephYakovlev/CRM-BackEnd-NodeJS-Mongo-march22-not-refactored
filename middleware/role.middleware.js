const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");

module.exports = (roles) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
      }
    
      try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"
        console.log(token);
    
        if (!token) {
          return res.status(401).json({ message: 'Нет авторизации' })

        }

        const { roles: userRoles} = jwt.verify(token, process.env.JWTSECRET)
        
        console.log(userRoles);
        
        let hasRole = false 
        roles.forEach(role => {
           if(roles.includes(role)) {
               hasRole = true
           }
        });
        
        if(!hasRole) {
            return res.status(403).json({message: "У вас нет доступа"})
        }

        next()
    
      } catch (e) {
        res.status(402).json({ message: 'Нет авторизации' })
      }
    }
}
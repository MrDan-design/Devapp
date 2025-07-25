const isAdmin = (req, res, next) => {
    if (req.user?.is_admin) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access only'});
    }
};

module.exports = isAdmin;
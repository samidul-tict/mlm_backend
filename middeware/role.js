module.exports = (role) => {
    // role = ['view', 'add', 'update', 'delete'];
    return (req, res, next) => {
        let baseUrl = req.baseUrl.split('/')[2];
        let currentRole = req.user.role.filter(role => baseUrl === role.url.split('/')[1])[0];
        let controls = currentRole ? currentRole.permission : [0, 0, 0, 0];

        if (!controls[role])
            return res.status(403).send({ message: "Access Denied" })

        next();
    }
}
const { Admin } = require('../../../models/admin');
const { validateAdmin } = require('../../../models/admin');
const jwt = require('jsonwebtoken');
const config = require('config');

// describe('admin-login,generateAuthToken', () => {
//     it('should return a valid JWT', () => {
//         var NewAdmin = new Admin.generateAuthToken({
//             _id:'5f842ffb1fe9444c3c5b9eb6',
//             name : 'Administrator',
//             email : 'admin@msl.com',
//             isAdmin : true
//         })
//         const token = NewAdmin

//         const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
//         expect(decoded).toMatchObject({'_id':'5f842ffb1fe9444c3c5b9eb6','name' : 'Administrator','email' : 'admin@msl.com','isAdmin' : true });
//     })
// })

describe('register,generateAuthToken', () => {
    it('should return validate', () => {
        const token = validateAdmin('rishi','admin@msl.com','8001686070', 'msl@123','5f7d4dc32796f6223449df6e');
        // const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        token.toMatchObject({name:'rishi',email:'admin@msl.com',phone:'8001686070',password:'msl@123',role:'5f7d4dc32796f6223449df6e'});
    })
})



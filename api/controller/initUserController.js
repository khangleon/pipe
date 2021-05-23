const Users = require("../models/userModel");

module.exports = function(app){
    app.get("/api/init-users", (req, res)=>{
            const userSample = [
                {
                    "account":"khang.lp",
                    "password": "123456",
                    "fullname": "Lê Phúc Khang"
                },
                {
                    "account":"trung.np",
                    "password": "123456",
                    "fullname": "Nguyễn Phúc Trung"
                },
                {
                    "account":"toan.nt",
                    "password": "123456",
                    "fullname": "Nguyễn Thanh Toàn"
                },
            ]

            Users.create(userSample, (err, users)=>{
                if (err) throw err;
                res.send(users);
            })
    })
}
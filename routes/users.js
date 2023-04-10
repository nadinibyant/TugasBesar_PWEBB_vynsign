var express = require('express');
var router = express.Router();
var db = require('../modules/db');
var user = require('../models/users');
const { response } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');


router.get('/', async function(req, res, next) {
  res.json({
    message: "Silahkan Login atau Register",
    redirectUrl: '/users/signup'
  });
});

router.post('/signup', async function(req, res, next) {
  let connection = db.connection;

  let id = req.body.id;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let nik = req.body.nik;
  let institute_name = req.body.institute_name;
  let city = req.body.city;
  let sign_img = req.body.sign_img;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const users = await user.create({
    id: id,
    username: username,
    email: email,
    password: hashedPassword,
    nik: nik,
    institute_name: institute_name,
    city: city,
    sign_img: sign_img,
  })
  if (users) {
    res.json({
      message: "Pendaftaran Akun Berhasil",
      data: {
        id: id,
        username: username,
        email: email,
        password: hashedPassword,
        nik: nik,
        institute_name: institute_name,
        city: city,
        sign_img: sign_img,
      },
      redirectUrl: '/users/signin'
    });
   } else {
    res.json({
      message: "Pendaftaran Akun Tidak Berhasil",
      redirectUrl: '/users/signup'
    });
   }
});

const authenticateToken = (req, res, next) => {
  // ambil token dari header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // verifikasi token
  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // simpan user
    req.user = user;
    next();
  });
}

router.post('/signin', async function(req, res, next){
  let email = req.body.email;
  let password = req.body.password;

  //cek email
  user.findOne({ where: { email: email } }).then(user => {
    if (!user) {
      //jika user tidak ditemukan
      res.status(401).json({ message: 'Email atau Password Salah' });
      return;
    }

    // cek password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        // Invalid password
        res.status(401).json({ message: 'Email atau Password Salah' });
        return;
      }

      //jika email dan password benar
      const token = jwt.sign({ email: email, password: password }, 'secretKey', { expiresIn: '30m' });
      res.json({ 
        token: token,
        redirectUrl:  '/home'
      });
    });
  });

})


router.get('/profile', authenticateToken, (req, res) => {
  res.json({ 
    username: req.user.username,
    redirectUrl: {
      akun: '/users/profile/:id',
      edit: '/users/profile/edit/:id'
    }
  });
});

router.get('/profile/:id', async function(req, res, next) {
    let id = req.params.id.slice(1);
    const users = await user.findByPk(id);
    res.json(users);
});

router.post('/profile/edit/:id', async function (req, res, next){

    let id = req.params.id.slice(1);
  
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let nik = req.body.nik;
    let institute_name = req.body.institute_name;
    let city = req.body.city;
    let sign_img = req.body.sign_img;
  
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
  
    const updateUser = await user.update({ 
      username: username,
      email: email,
      password: hashedPassword,
      nik: nik,
      institute_name: institute_name,
      city: city,
      sign_img: sign_img}, {
      where: {
        id: id
      }
    });
    
  
    const userInstance = await user.findByPk(id);
  if (!userInstance) {
    return res.status(404).json({ message: 'Data tidak ditemukan' });
  }
  
  userInstance.username = username;
  userInstance.email = email;
  userInstance.password = hashedPassword;
  userInstance.nik = nik;
  userInstance.institute_name = institute_name;
  userInstance.city = city;
  userInstance.sign_img = sign_img;
  
  await userInstance.save();
  
  return res.json({
    message : 'Data Berhasil di Ubah',
    data: userInstance
  });
   
  });

module.exports = router;

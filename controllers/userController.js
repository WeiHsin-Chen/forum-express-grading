const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const fs = require('fs')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID



const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    Comment.findAndCountAll({
      include: [
        User,
        Restaurant
      ],
      where: { userId: req.params.id }
    }).then(result => {
      const totalComment = Number(result.count)
      console.log(totalComment)
      const data = result.rows.map(comment => ({
        ...comment,
        restaurantId: comment.Restaurant.id,
        restaurantImage: comment.Restaurant.image
      }))
      User.findByPk(req.params.id)
        .then(user => {
          return res.render('profile', {
            user: user.toJSON(),
            totalComment: totalComment,
            restaurants: data
          })
        })
    })
      .catch(err => console.log(err))
  },
  editUser: (req, res) => {
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      req.flash('error_messages', '無法編輯其他使用者的資料')
      return res.redirect(`/users/${req.user.id}`)
    }
    User.findByPk(req.params.id
    ).then(user => {
      return res.render('profileEdit', {
        user: user.toJSON()
      })
    })
      .catch(err => console.log(err))
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '請輸入使用者名稱')
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            }).then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${req.params.id}`)
            })
              .catch(err => console.log(err))
          })
      })
    }
    else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          }).then((user) => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect(`/users/${req.params.id}`)
          })
            .catch(err => console.log(err))
        })
    }
  }
}

module.exports = userController
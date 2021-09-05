'use strict';
const faker = require('faker')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant
const getSeederId = new Promise((resolve, reject) => {
  User.findOne({ where: { name: 'user1' } }, { raw: true, nest: true })
    .then(user => {
      return resolve(user.id)
    })
})
const getRestaurantId = new Promise((resolve, reject) => {
  Restaurant.findAll({ raw: true, nest: true })
    .then(restaurants => {
      const restaurantIds = []
      restaurants.forEach(restaurant => {
        restaurantIds.push(restaurant.id)
      })
      return resolve(restaurantIds)
    })
})

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const seederId = await getSeederId
    const restaurantIds = await getRestaurantId

    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 10 }).map((d, i) =>
      ({
        text: faker.lorem.sentence(),
        UserId: seederId,
        RestaurantId: restaurantIds[Math.floor(Math.random() * restaurantIds.length)],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
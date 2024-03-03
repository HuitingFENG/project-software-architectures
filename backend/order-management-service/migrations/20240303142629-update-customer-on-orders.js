'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'customerId');
    await queryInterface.addColumn('orders', 'customers', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'customers');
    await queryInterface.addColumn('orders', 'customerId', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
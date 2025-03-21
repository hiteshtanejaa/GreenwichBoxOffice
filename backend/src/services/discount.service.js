// src/services/discount.service.js
class DiscountService {
    constructor(db) {
      this.db = db;
    }
  
    // Get discount percentage for a user type, e.g. 'Children', 'Old Age Pensioners', 'Social Group'
    getDiscountPercentage(discountType) {
      return new Promise((resolve, reject) => {
        const query = "SELECT discountPercentage FROM Discount WHERE discountType = ?";
        this.db.query(query, [discountType], (err, results) => {
          if (err) return reject(err);
          if (results.length === 0) return resolve(0); // no discount found
          resolve(parseFloat(results[0].discountPercentage));
        });
      });
    }
  
    // Calculate discount amount given a price and discount percentage
    calculateDiscount(price, discountPercentage) {
      return (price * discountPercentage) / 100;
    }
  }
  
  module.exports = DiscountService;
  
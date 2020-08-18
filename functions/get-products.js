const products = require('../src/data/products.json');

exports.handler = async (event, context) => {
    try {
        return {
            statusCode: 200,
            body: JSON.stringify(products),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: error.toString()
        }
    }
}
module.exports = async () => {
    const stripe = require('stripe')('sk_test_51G9oDOD77Y1fgk7ItojYVNrRW9jre9DJyPdLbJAo2rsmx3v7lAb2MbpU6V6X79R2xhYiBSlgrmY0mtW6J7IZtCFN005A6ujh4A');
    let product = await stripe.products.retrieve('prod_HdIF080zG99F2f')
    return product
} 
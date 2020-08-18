const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const inventory = require('../src/data/products.json')

exports.handler = async ({ body }) => {
    try {
        const { sku, quantity } = JSON.parse(body)
        console.log(body)
        const product = inventory.items.find(product => product.sku === sku)
        const validatedQuantity = quantity > 0 ? quantity : 1
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: product.amount,
                        product_data: {
                            name: product.name,
                            description: product.description,
                            images: product.images,
                        }
                    },
                    quantity: validatedQuantity,
                },
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: 300,
                        product_data: {
                            name: 'Shipping and Handling',
                            description: 'Flat rate shipping anywhere in the USA!',
                            images: [],
                        }
                    },
                    quantity: 1,
                },
            ],
            shipping_address_collection: {
                allowed_countries: ['US']
            },
            mode: 'payment',
            success_url: 'https://localhost:8080/success',
            cancel_url: 'https://localhost:8080/',
        })

        return {
            statusCode: 200,
            body: JSON.stringify(session.id),
        }
    } catch (error) {
        console.log(error)
        return {
            statusCode: 500,
            body: error.toString()
        }
    }
}
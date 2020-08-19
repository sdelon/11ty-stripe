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
                        currency: 'eur',
                        unit_amount: product.amount * 100,
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
                        currency: 'eur',
                        unit_amount: 350,
                        product_data: {
                            name: 'Frais de port',
                            description: 'Frais fixes de livraison standard',
                            images: [],
                        }
                    },
                    quantity: 1,
                },
            ],
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: ['FR', 'BE', 'CH', 'LU'],
            },
            mode: 'payment',
            success_url: 'https://test-ecommerce11ty.netlify.app/success',
            cancel_url: 'https://test-ecommerce11ty.netlify.app/',
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
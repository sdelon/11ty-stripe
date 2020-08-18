const stripe = require('stripe')(process.env.STRIPE_API_SECRET);
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

// Netlify sends the event object which is deconstructed below to the headers and body
exports.handler = async ({ headers, body }) => {
    // verify webhook signature
    let event
    try {
        event = stripe.webhooks.constructEvent(
            body, 
            headers['stripe-signature'], 
            process.env.STRIPE_WEBHOOK_SECRET)

        // ignore any other kinds of events
        if (event.type !== 'checkout.session.completed') {
            return;
        }

        // get out the shipping address and the checkout session ID to retrieve items
        const { data: { object: { id, shipping } } } = event

        // retrieve the order items for the email
        const { data: items } = await stripe.checkout.sessions.listLineItems(id);

        // read out the shipping address parts
        const {
            line1,
            line2,
            city,
            state,
            postal_code,
            country
        } = shipping.address

        // read out the line items and format email
        const msg = {
            to: process.env.FULFILLMENT_EMAIL_ADDRESS,
            from: process.env.FROM_EMAIL_ADDRESS,
            subject: `New Order from KeyWestGroundParrot.com!`,
            text: `
Items:
${items.map(item => `- (${item.quantity}) ${item.description}`).join('\n')}
Shipping Address:
${shipping.name}
${line1}${line2 !== null ? '\n' + line2 : ''}
${city}, ${state} ${postal_code}
${country}
`,
        };
        console.log(msg)
        // send email
        await mail.send(msg);

        // let Stripe know everything worked out just fine
        return {
            statusCode: 200,
            body: JSON.stringify({ received: true })
        }
    } catch (error) {
        // let Stripe know something went wrong
        return {
            statusCode: 400,
            body: `Webhook Error: ${error.message}`
        }
    }
}
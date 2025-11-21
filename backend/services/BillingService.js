const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');
const User = require('../models/User');

class BillingService {
    /**
     * Create a checkout session for a subscription
     */
    static async createCheckoutSession(userId, email, priceId) {
        try {
            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                customer_email: email,
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
                metadata: {
                    userId: userId.toString()
                }
            });

            return session;
        } catch (error) {
            logger.error('Stripe checkout error:', error);
            throw new Error('Failed to create checkout session');
        }
    }

    /**
     * Create a customer portal session
     */
    static async createPortalSession(userId) {
        try {
            // In a real app, we would store the stripe_customer_id in the User model
            // For now, we'll just return a mock URL or error if not implemented
            // This requires saving the customer ID from the webhook first

            // const user = await User.findById(userId);
            // if (!user.stripe_customer_id) throw new Error('No billing account found');

            // const session = await stripe.billingPortal.sessions.create({
            //   customer: user.stripe_customer_id,
            //   return_url: `${process.env.FRONTEND_URL}/dashboard`,
            // });
            // return session.url;

            throw new Error('Billing portal not yet available');
        } catch (error) {
            logger.error('Stripe portal error:', error);
            throw error;
        }
    }

    /**
     * Handle Stripe webhooks
     */
    static async handleWebhook(signature, payload) {
        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object;
                    await this.handleSubscriptionSuccess(session);
                    break;
                case 'invoice.payment_failed':
                    // Handle failed payment
                    break;
            }

            return { received: true };
        } catch (error) {
            logger.error('Webhook error:', error);
            throw new Error(`Webhook Error: ${error.message}`);
        }
    }

    static async handleSubscriptionSuccess(session) {
        const userId = session.metadata.userId;
        // Update user subscription status in DB
        // await User.updateSubscription(userId, 'pro');
        logger.info(`Subscription successful for user ${userId}`);
    }
}

module.exports = BillingService;

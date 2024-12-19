import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

import { selectCartTotal } from '../../store/cart/cart.selector';
import { selectCurrentUser } from '../../store/user/user.selector';
import { clearCartItems, setIsCartOpen } from '../../store/cart/cart.action';

import { FormContainer } from './payment-form.styles';
import { BUTTON_TYPE_CLASSES } from '../button/button.component';

import { PaymentButton, 
    PaymentFormContainer, 
    TestCardContainer
} from './payment-form.styles';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const amount = useSelector(selectCartTotal);
    const currentUser = useSelector(selectCurrentUser);
    const clearCart = () => dispatch(clearCartItems());
    const toggleIsCartOpen = () => dispatch(setIsCartOpen(false));
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const paymentHandler = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessingPayment(true);
        const response = await fetch('/.netlify/functions/create-payment-intent', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: amount * 100 }),
            }).then((res) => {
                return res.json();
        });

        const clientSecret = response.paymentIntent.client_secret;

        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
                name: currentUser ? currentUser.displayName : 'Guest',
            },
        },
        });

        setIsProcessingPayment(false);

        if (paymentResult.error) {
            alert(paymentResult.error.message);
        } else {
            if (paymentResult.paymentIntent.status === 'succeeded') {
                alert('Payment Successful!');
                clearCart();
                toggleIsCartOpen();
            }
        }
    };

    return (
        <div>
            <PaymentFormContainer>
                <FormContainer onSubmit={paymentHandler}>
                    <h2>Credit Card Payment:</h2>
                    <CardElement />
                    <PaymentButton
                        buttonType={BUTTON_TYPE_CLASSES.inverted}
                        isLoading={isProcessingPayment}
                    >
                    Pay Now
                    </PaymentButton>
                </FormContainer>
            </PaymentFormContainer>
            <TestCardContainer>To simulate a successful payment for a specific card brand, please follow this link to get test cards credentials: 
            <a style={{"color":"violet"}} href="https://docs.stripe.com/testing#cards"> docs.stripe.com</a>
            </TestCardContainer>
        </div>
    );
};

export default PaymentForm;
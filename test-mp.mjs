import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  const payload = {
    items: [
      {
        id: '123',
        title: 'Test Product',
        quantity: 1,
        unit_price: 100,
        currency_id: 'ARS',
      }
    ],
    payer: {
      email: 'test@example.com',
    },
    back_urls: {
      success: `http://localhost:3000/checkout/success`,
      failure: `http://localhost:3000/checkout/failure`,
      pending: `http://localhost:3000/checkout/pending`,
    },
    external_reference: 'order_123',
  };

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error(err);
  }
}

run();

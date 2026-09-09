const jwt = require('jsonwebtoken');

const token = jwt.sign({ userId: 'xkcDGYfn2JU1vqj82T6Y', role: 'USER' }, 'fallback_secret_key_for_dev_only', { expiresIn: '30d' });

async function testLiveAPI() {
  try {
    const res = await fetch('https://ns-jewellery.onrender.com/api/plans/my-plans', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

testLiveAPI();

// src/services/auth0Service.js

import axios from 'axios';

export async function getManagementToken() {
  const res = await axios.post(`https://auth.gosenku.com/oauth/token`, {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: `https://auth.gosenku.com/api/v2/`,
    grant_type: 'client_credentials'
  });

  return res.data.access_token;
}

export async function createAuth0User({ email, password, name, phone, role, merchantId, branchId }) {
  const token = await getManagementToken();

  const user = await axios.post(
    'https://auth.gosenku.com/api/v2/users',
    {
      connection: 'Username-Password-Authentication',
      email,
      password,
      name,
      phone_number: phone,
      app_metadata: {
        role,
        merchantId,
        branchId
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return user.data;
}

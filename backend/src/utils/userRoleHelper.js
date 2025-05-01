// src/utils/userRoleHelper.js

export function getUserRole(user) {
    const role = user.role || user['https://senku.gosenku.com/role'];
    const merchantId = user.merchantId || user['https://senku.gosenku.com/merchantId'];
    const branchId = user.branchId || user['https://senku.gosenku.com/branchId'];
  
    if (role === 'branch' || (merchantId && branchId)) {
      return 'branch';
    }
    if (role === 'merchant' || (merchantId && !branchId)) {
      return 'merchant';
    }
    if (role === 'customer') {
      return 'customer';
    }
    return 'unknown';
  }
  
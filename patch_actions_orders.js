const fs = require('fs');

let content = fs.readFileSync('src/actions/orders.ts', 'utf8');

// Remove mockOrders fallbacks
content = content.replace(
`  if (!user) {
    // Fallback if not logged in just for testing in mock UI
    const newOrder = {
      id: \`ord-\${Date.now()}\`,
      userId: 'current-user',
      items,
      totalAmount,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder as any);
    return newOrder.id;
  }`,
`  if (!user) {
    throw new Error('Unauthorized');
  }`);

content = content.replace(
`  if (error) {
    console.error('Error updating payment proof:', error);
    // Fallback logic
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'awaiting_verification';
      order.transactionReference = transactionReference;
    } else {
      return { success: false, error: 'Order not found' };
    }
  }`,
`  if (error) {
    console.error('Error updating payment proof:', error);
    return { success: false, error: 'Order not found or update failed' };
  }`);

content = content.replace(
`  if (error) {
    console.error('Error confirming payment:', error);
    // Fallback logic
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = 'paid';
    } else {
      return { success: false, error: 'Order not found' };
    }
  }`,
`  if (error) {
    console.error('Error confirming payment:', error);
    return { success: false, error: 'Order not found or update failed' };
  }`);

fs.writeFileSync('src/actions/orders.ts', content);

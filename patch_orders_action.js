const fs = require('fs');
let code = fs.readFileSync('src/actions/orders.ts', 'utf8');

code = code.replace(
`  const orderItemsPayload = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    customization_data: item.customizationData as any
  }));`,
`  // Validate childIds if recipientType is child
  const childIds = items
    .filter(i => i.customizationData?.recipientType === 'child' && i.customizationData?.childId)
    .map(i => i.customizationData!.childId!);
    
  if (childIds.length > 0) {
    const { data: validChildren } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_profile_id', user.id)
      .in('id', childIds);
      
    const validChildIds = new Set(validChildren?.map(c => c.id) || []);
    for (const childId of childIds) {
      if (!validChildIds.has(childId)) {
        throw new Error(\`Invalid child ID: \${childId}. It does not belong to the current user.\`);
      }
    }
  }

  const orderItemsPayload = items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    customization_data: item.customizationData as any
  }));`);
fs.writeFileSync('src/actions/orders.ts', code);

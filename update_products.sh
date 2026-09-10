sed -i '/import { mockAllUsers/a import { mockOrders } from "./orders";' src/data/domains/products.ts
sed -i '/export const mockPublisherOrders/,/\];/d' src/data/domains/products.ts
sed -i '/export async function getPublisherOrders/,/}/c\
export async function getPublisherOrders() {\
  await new Promise(resolve => setTimeout(resolve, 600));\
  \
  const publisherOrders: PublisherOrder[] = [];\
  mockOrders.forEach(order => {\
    order.items.forEach(item => {\
      const product = mockProducts.find(p => p.id === item.productId);\
      if (product && product.ownerType === "publisher" && product.publisherId) {\
        const totalAmount = item.price * item.quantity;\
        const publisherShare = totalAmount * 0.7;\
        publisherOrders.push({\
          id: `po-${order.id}-${item.productId}`,\
          orderId: order.id,\
          productName: product.name,\
          quantity: item.quantity,\
          totalAmount: totalAmount,\
          publisherShare: publisherShare,\
          status: order.status === "completed" ? "completed" : order.status === "cancelled" ? "cancelled" : "pending",\
          createdAt: order.createdAt\
        });\
      }\
    });\
  });\
  return publisherOrders;\
}' src/data/domains/products.ts

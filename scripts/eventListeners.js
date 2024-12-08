import { getRandomAdjectives } from "./generators";

export function handleLogout() {
    localStorage.removeItem('token');
    location.reload();
}

export async function fetchPendingOrders() {
    const token = localStorage.getItem('token');
    try {
        const call = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return await call.json()
    } catch (error) {
        console.error('Error fetching orders:', error)
    }
}

export function generateCart(currentOrders) {
    const ordersContainer = document.getElementById('orders');
    ordersContainer.innerHTML = '';
    currentOrders.forEach(order => {
        ordersContainer.innerHTML += `
            <div class="order-container" data-id="${order._id}">
                <div>
                    <h2>${order.title}</h2>
                    <h3>Size: ${order.size} EU</h3>
                </div>
            <div class="order-container-right">
                <h3>€${order.price}</h3>
            </div>`;
    });

     // Update order summary
     const subtotal = currentOrders.reduce((sum, order) => sum + order.price * order.quantity, 0);
     document.querySelector('.subtotal h3:last-child').textContent = `€${subtotal}`;
     const shipping = 25; // Example shipping cost
     document.querySelector('.shipping h3:last-child').textContent = `€${shipping}`;
     const total = subtotal + shipping;
     document.querySelector('.total h3:last-child').textContent = `€${total}`;
}

export function showCart(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('loginPopup').style.display = 'flex';
    } else {
        document.querySelector('.title').style.display = 'none';
        document.querySelector('.canvas').style.display = 'none';
        document.querySelector('.preferences').style.display = 'none';
        document.querySelector('.filled-cart').style.display = 'block';
        document.querySelector('.order-confirmation').style.display = 'none';
    }
}

export async function addPendingOrder(composition) {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    const orderData = {
        title: getRandomAdjectives(),
        price: Number(document.querySelector('.title h2').textContent.replace('€', '')),
        deliveryStatus: 'Pending',
        paymentStatus: false,
        timeOfOrder: new Date().toISOString(),
        parts: composition,
        name: document.getElementById('shoeName').value,
        size: document.getElementById('sizes').value,
        quantity: 1,
        userId: id
    };

    try {
        const call = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData),
        })
        return await call.json()
    } catch (error) {
         console.error('Error:', error)
    }
}

export function completeOrder() {
    const token = localStorage.getItem('token');
    const ordersContainer = document.querySelectorAll('.order-container');

    ordersContainer.forEach(orderElement => {
        const orderId = orderElement.dataset.id;

        fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ paymentStatus: true }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Order updated:', data);
            })
            .catch(error => {
                console.error('Error updating order:', error);
            });
    });

    document.querySelector('.title').style.display = 'none';
    document.querySelector('.canvas').style.display = 'none';
    document.querySelector('.preferences').style.display = 'none';
    document.querySelector('.filled-cart').style.display = 'none';
    document.querySelector('.order-confirmation').style.display = 'block';
}
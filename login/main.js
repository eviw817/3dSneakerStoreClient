document.getElementById('submit').addEventListener('click', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('%VITE_API_URL%/users/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('username', data.data.user.username);
        localStorage.setItem('id', data.data.user._id);
        window.location.href = 'index.html';
    }
});
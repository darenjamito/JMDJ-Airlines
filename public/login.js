document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const alertMessage = document.createElement('div');
        alertMessage.id = 'alertMessage';
        alertMessage.style.color = 'red';
        alertMessage.style.marginTop = '10px';
        alertMessage.style.textAlign = 'center';
        this.appendChild(alertMessage);

        const username = this.username.value;
        const password = this.password.value;

        if (!username || !password) {
            alertMessage.textContent = 'Please enter both username and password';
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                alertMessage.style.color = 'green';
                alertMessage.textContent = 'Login successful! Redirecting...';

                // Store user info in session storage
                sessionStorage.setItem('user', JSON.stringify({
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    isAdmin: data.isAdmin
                }));

                // Redirect based on user role
                setTimeout(() => {
                    if (data.isAdmin) {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/user/dashboard';
                    }
                }, 1000);
            } else {
                // Failed login
                alertMessage.style.color = 'red';
                alertMessage.textContent = data.message || 'Login failed. Please try again.';
            }
        } catch (error) {
            console.error('Login error:', error);
            alertMessage.textContent = 'An error occurred during login. Please try again.';
        }
    });
});

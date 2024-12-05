document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const alertMessage = document.getElementById('alertMessage');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(signupForm);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Successful signup
                alertMessage.style.color = 'green';
                alertMessage.textContent = 'Registration successful! Redirecting to login...';
                
                // Clear form
                signupForm.reset();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Handle specific error cases
                alertMessage.style.color = 'red';
                if (data.error === 'username_exists') {
                    const usernameInput = signupForm.querySelector('input[name="username"]');
                    usernameInput.setCustomValidity('Username already exists');
                    usernameInput.reportValidity();
                    alertMessage.textContent = 'Username already exists. Please choose a different username.';
                } else {
                    alertMessage.textContent = data.message || 'Registration failed. Please try again.';
                }
            }
        } catch (error) {
            alertMessage.style.color = 'red';
            alertMessage.textContent = 'An error occurred. Please try again later.';
            console.error('Error:', error);
        }
    });

    // Clear custom validity when user starts typing
    const usernameInput = signupForm.querySelector('input[name="username"]');
    usernameInput.addEventListener('input', () => {
        usernameInput.setCustomValidity('');
    });
});

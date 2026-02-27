document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusMessage = document.getElementById('statusMessage');

    // Simple validation
    if (password !== confirmPassword) {
        statusMessage.textContent = "Passwords do not match!";
        statusMessage.style.color = "red";
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (data.success) {
            statusMessage.textContent = "Registration successful! Redirecting to login...";
            statusMessage.style.color = "green";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            statusMessage.textContent = data.message;
            statusMessage.style.color = "red";
        }

    } catch (err) {
        console.error(err);
        statusMessage.textContent = "Server error.";
        statusMessage.style.color = "red";
    }
});
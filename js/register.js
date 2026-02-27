document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusMessage = document.getElementById('statusMessage');

    // ===== Validation =====
    // Password must length >= 8
    if (password.length < 8) {
        alert("Password must be at least 8 characters!");
        return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Email must be @qiu.edu.my
    const emailPattern = /^[a-zA-Z0-9._%+-]+@qiu\.edu\.my$/;
    if (!emailPattern.test(email)) {
        alert("Email must be a valid @qiu.edu.my address!");
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
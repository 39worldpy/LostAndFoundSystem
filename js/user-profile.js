document.addEventListener('DOMContentLoaded', async () => {
    const profileDiv = document.getElementById('profileInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    try {
        const res = await fetch('/api/session');
        const data = await res.json();

        if (!data.loggedIn) {
            // Redirect to login if not logged in
            window.location.href = '/login.html';
            return;
        }

        const user = data.user;

        // Display user info
        profileDiv.innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
        `;

    } catch (err) {
        console.error('Error fetching session:', err);
        profileDiv.innerHTML = '<p>Error loading profile.</p>';
    }

    logoutBtn.addEventListener('click', async () => {

        const confirmLogout = confirm("Are you sure you want to logout?");
         
        if (!confirmLogout) return; 

        try {
            const res = await fetch('/api/logout');
            const data = await res.json();

            if (data.success) {
                alert("You have been logged out."); 
                window.location.href = '/login.html';
            } else {
                alert('Logout failed');
            }
        } catch (err) {
                console.error('Logout error:', err);
    }
});
});
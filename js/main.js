document.addEventListener('DOMContentLoaded', async () => {

    const res = await fetch('/api/session');
    const data = await res.json();

    if (data.loggedIn) {
        const loginNav = document.getElementById('loginNav');

        loginNav.innerHTML = `
        <a href="user-history.html" class="user-history">My History</a>
        <a href="user-profile.html"><i class="fa-solid fa-user user-icon"></i>Welcome, ${data.user.username}</a>
        `;
    } else {
        loginNav.innerHTML = `<a href="login.html">Login</a>`;
    }
});


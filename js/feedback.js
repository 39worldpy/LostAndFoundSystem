// feedback.js
document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // prevent default form submission

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const feedback = document.getElementById('feedback').value.trim();

    // Simple validation
    if (!name || !email || !feedback) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        // Send POST request to backend
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, feedback })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(data.message); // show success alert
            this.reset(); // clear the form
        } else {
            alert(data.message || 'Failed to submit feedback.');
        }
    } catch (err) {
        console.error(err);
        alert('Error submitting feedback. Try again.');
    }
});
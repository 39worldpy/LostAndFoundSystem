document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = document.getElementById('reportForm');
    const formData = new FormData(form); 

    try {
        const res = await fetch('/api/items', {
            method: 'POST',
            body: formData 
        });

        const result = await res.json();
        console.log(result);

        if (result.success) {
            alert('Report submitted successfully!');
            form.reset();
        } else {
            alert('Failed to submit report.');
        }
    } catch (err) {
        console.error(err);
    }
});
document.addEventListener('DOMContentLoaded', async () => {

    const foundContainer = document.getElementById('foundCards');
    const lostContainer = document.getElementById('lostCards');

    async function fetchRecentItems() {
        try {
            const res = await fetch('/api/items'); 
            const items = await res.json();

            // Separate items by status
            const foundItems = items.filter(i => i.category === 'Found');
            const lostItems  = items.filter(i => i.category === 'Lost');

            displayCards(foundItems, foundContainer);
            displayCards(lostItems, lostContainer);

        } catch (err) {
            console.error('Failed to load recent items', err);
        }
    }

    function displayCards(items, container) {
        container.innerHTML = '';
        if (!items.length) {
            container.innerHTML = '<p>No items yet.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'main-page-3-card';

            card.innerHTML = `
                <img src="/images/${item.image || ''}" 
                alt="${item.title}" 
                loading="lazy">
                
                <div class="card-body">
                    <p class="card-title">${item.title}</p>
                    <span class="card-status ${item.status.toLowerCase()}">${item.status}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    fetchRecentItems();
});
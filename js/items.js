document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('itemsContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const applyBtn = document.getElementById('applyFilterBtn');

    let allItems = [];

    async function fetchItems() {
        try {
            const res = await fetch('/api/items');
            allItems = await res.json();
            displayItems(allItems);
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p>Error loading items.</p>';
        }
    }

   function displayItems(items) {
    
    container.innerHTML = '';

    items.forEach(item => {

        const card = document.createElement('div');
        card.className = 'items-page item-card';

        card.innerHTML = `
            <div class="card-image">
                ${item.image 
                    ? `<img src="/images/${item.image}" alt="${item.title}" class="zoomable">`
                    : `<div class="no-image">No Image</div>`
                }
                <span class="status-badge ${item.status.toLowerCase()}">
                    ${item.status}
                </span>
            </div>

            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-category">${item.category}</p>
                <div class="card-details">
                    <p><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
                    <p><i class="fa-solid fa-calendar"></i> ${new Date(item.date).toLocaleDateString()}</p>
                </div>
                <p class="card-contact">
                    <i class="fa-solid fa-phone"></i> ${item.contact_info}
                </p>
                <p class="card-user">
                    Posted by <strong>${item.submitted_by || 'N/A'}</strong>
                </p>
            </div>
        `;

        container.appendChild(card);

        const img = card.querySelector('.zoomable');

        if (img) {
            img.addEventListener('click', () => showImageModal(img.src));
        }
    });

    }

    function applyFilter() {

        const category = categoryFilter.value;
        const status = statusFilter.value.toLowerCase();
        const search = searchInput.value.toLowerCase();

        const filtered = allItems.filter(item => {
            const matchCategory = category ? item.category === category : true;
            const matchStatus = status ? item.status.toLowerCase() === status : true;
            const matchSearch = search ? item.title.toLowerCase().includes(search) : true;
            return matchCategory && matchStatus && matchSearch;
        });

        displayItems(filtered);
    }

    applyBtn.addEventListener('click', applyFilter);
    fetchItems();

});

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.querySelector('.close-modal');

function showImageModal(src) {
    modal.style.display = 'flex';
    modalImg.src = src;
}

// Close modal with X
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal by clicking outside the image
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

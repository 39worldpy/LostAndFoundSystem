document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('myhistoryContainer');

    async function fetchMyItems() {
        
        try {
            const res = await fetch('/api/my-items');
            const items = await res.json();

            container.innerHTML = '';

            if (items.length === 0) {
                container.innerHTML = '<p>No items posted yet.</p>';
                return;
            }

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'item-card';

                card.innerHTML = `
                    <div class="card-image">
                        ${item.image ? `<img src="/images/${item.image}" alt="${item.title}">` : `<div class="no-image">No Image</div>`}
                        <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
                    </div>

                    <div class="card-body">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-category">${item.category}</p>

                        <div class="card-details">
                            <p><i class="fa-solid fa-location-dot"></i> ${item.location}</p>
                            <p><i class="fa-solid fa-calendar"></i> ${new Date(item.date).toLocaleDateString()}</p>
                        </div>

                        <p class="card-contact"><i class="fa-solid fa-phone"></i> ${item.contact_info}</p>

                        <div class="update-section button-group">
                            <select class="status-select" id="status-${item.id}">
                                <option value="Active" ${item.status === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Claimed" ${item.status === 'Claimed' ? 'selected' : ''}>Claimed</option>
                                <option value="Resolved" ${item.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                            </select>

                            <button class="update-btn" onclick="updateStatus(${item.id})">Update</button>
                            <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });

        } catch (err) {
            container.innerHTML = '<p>Error loading items.</p>';
            console.error(err);
        }
    }

    window.updateStatus = async function(id) {
        const newStatus = document.getElementById(`status-${id}`).value;

        try {
            const res = await fetch(`/api/items/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (data.success) {
                alert('Status updated!');
                fetchMyItems();
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Update failed.');
        }
    };

    fetchMyItems();
});

async function deleteItem(id) {
    const confirmDelete = confirm("Are you sure you want to delete this item?");

    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/items/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error("Failed to delete item");
        }

        alert("Item deleted successfully!");
        location.reload();

    } catch (error) {
        console.error("Delete error:", error);
        alert("Error deleting item.");
    }
}

// API Base URL
const API_BASE = '/api/rutracker';

// State
let searchResults = [];
let currentSort = { field: null, ascending: true };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleSearch);

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const sortField = header.dataset.sort;
            sortTable(sortField);
        });
    });
}

// Check login status
async function checkStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (data.isLoggedIn) {
            indicator.classList.add('online');
            statusText.textContent = 'Connected';
        } else {
            indicator.classList.remove('online');
            statusText.textContent = 'Not logged in';
        }
    } catch (error) {
        console.error('Status check failed:', error);
        showToast('Failed to check status', 'error');
    }
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const year = document.getElementById('year').value.trim();
    const season = document.getElementById('season').value.trim();
    
    if (!title) {
        showToast('Please enter a title', 'error');
        return;
    }

    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const searchBtnText = document.getElementById('searchBtnText');
    const searchBtnLoader = document.getElementById('searchBtnLoader');
    
    searchBtn.disabled = true;
    searchBtnText.style.display = 'none';
    searchBtnLoader.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, year, season }),
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const results = await response.json();
        searchResults = results;
        displayResults(results);
        
        // Update status after successful search
        checkStatus();
    } catch (error) {
        console.error('Search error:', error);
        showToast(error.message, 'error');
    } finally {
        // Reset button state
        searchBtn.disabled = false;
        searchBtnText.style.display = 'inline';
        searchBtnLoader.style.display = 'none';
    }
}

// Display search results
function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const emptyState = document.getElementById('emptyState');
    const resultsBody = document.getElementById('resultsBody');
    const resultsCount = document.getElementById('resultsCount');

    if (results.length === 0) {
        resultsSection.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = 'No results found. Try a different search.';
        return;
    }

    // Hide empty state and show results
    emptyState.style.display = 'none';
    resultsSection.style.display = 'block';
    resultsCount.textContent = `${results.length} results found`;

    // Clear previous results
    resultsBody.innerHTML = '';

    // Add results
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="torrent-name">${escapeHtml(result.name)}</td>
            <td>${result.size}</td>
            <td>${result.seeders}</td>
            <td>${result.leechers}</td>
            <td>${escapeHtml(result.forum)}</td>
            <td>
                <div class="actions">
                    <button class="btn btn-sm btn-success" onclick="getMagnetLink('${result.id}')">
                        🧲 Magnet
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="viewDetails('${result.id}')">
                        📄 Details
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="downloadTorrent('${result.id}')">
                        ⬇️ Download
                    </button>
                </div>
            </td>
        `;
        resultsBody.appendChild(row);
    });
}

// Sort table
function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.field = field;
        currentSort.ascending = true;
    }

    const sortedResults = [...searchResults].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle numeric fields
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return currentSort.ascending ? aVal - bVal : bVal - aVal;
        }

        // Handle string fields
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
    });

    displayResults(sortedResults);
}

// Get magnet link
async function getMagnetLink(torrentId) {
    try {
        const response = await fetch(`${API_BASE}/magnet/${torrentId}`);
        
        if (!response.ok) {
            throw new Error('Failed to get magnet link');
        }

        const data = await response.json();
        
        // Copy to clipboard
        await navigator.clipboard.writeText(data.magnetLink);
        showToast('Magnet link copied to clipboard!', 'success');
        
        // Also open in new tab
        window.open(data.magnetLink, '_blank');
    } catch (error) {
        console.error('Get magnet error:', error);
        showToast(error.message, 'error');
    }
}

// View torrent details
async function viewDetails(torrentId) {
    const modal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');
    
    // Show modal with loader
    modal.classList.add('show');
    modalBody.innerHTML = '<div class="loader" style="margin: 2rem auto;"></div>';

    try {
        const response = await fetch(`${API_BASE}/details/${torrentId}`);
        
        if (!response.ok) {
            throw new Error('Failed to get details');
        }

        const details = await response.json();
        
        // Display details
        modalBody.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Title</div>
                <div class="detail-value">${escapeHtml(details.title || 'N/A')}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Torrent ID</div>
                <div class="detail-value">${escapeHtml(details.id)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Magnet Link</div>
                <div class="detail-value">
                    <a href="${escapeHtml(details.magnetLink)}" target="_blank" style="word-break: break-all;">
                        ${escapeHtml(details.magnetLink)}
                    </a>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Download Link</div>
                <div class="detail-value">
                    <a href="${escapeHtml(details.downloadLink)}" target="_blank">
                        ${escapeHtml(details.downloadLink)}
                    </a>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Description</div>
                <div class="detail-value">${details.content || 'No description available'}</div>
            </div>
        `;
    } catch (error) {
        console.error('Get details error:', error);
        modalBody.innerHTML = `<p style="color: var(--danger-color);">Failed to load details: ${error.message}</p>`;
    }
}

// Close details modal
function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('show');
}

// Close modal when clicking outside
document.getElementById('detailsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') {
        closeDetailsModal();
    }
});

// Download torrent file
async function downloadTorrent(torrentId) {
    try {
        const response = await fetch(`${API_BASE}/download/${torrentId}`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to download torrent file');
        }

        const data = await response.json();
        showToast(data.message, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast(error.message, 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

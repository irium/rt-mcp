// API Base URL
const API_BASE = '/api/rutracker';

// State
let searchResults = [];
let currentSort = { field: null, ascending: true };

// Search History
const MAX_HISTORY_ITEMS = 10;

// HD Video Filter
let hdVideoFilter = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkStatus();
    setupEventListeners();
    renderSearchHistory();
    
    // Load saved HD filter
    const savedHDFilter = localStorage.getItem('hdVideoFilter');
    if (savedHDFilter) {
        hdVideoFilter = JSON.parse(savedHDFilter);
        updateHDFilterButton();
    }
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

// Theme Management
function initTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggle(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeToggle(theme) {
    const slider = document.querySelector('.theme-toggle-slider');
    if (slider) {
        slider.textContent = theme === 'dark' ? '🌙' : '☀️';
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
        
        // Save to history after successful search
        saveToHistory({ title, year, season });
        
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
    // Apply HD filter
    let filtered = results;
    if (hdVideoFilter) {
        filtered = results.filter(r => 
            r.forum.includes('HD Video') || r.forum.includes('HD Видео')
        );
    }
    
    const resultsSection = document.getElementById('resultsSection');
    const emptyState = document.getElementById('emptyState');
    const resultsBody = document.getElementById('resultsBody');
    const resultsCount = document.getElementById('resultsCount');

    if (filtered.length === 0) {
        resultsSection.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = 
            results.length > 0 
                ? `No HD Video results found (${results.length} total results)`
                : 'No results found. Try a different search.';
        return;
    }

    // Hide empty state and show results
    emptyState.style.display = 'none';
    resultsSection.style.display = 'block';
    resultsCount.textContent = 
        filtered.length === results.length 
            ? `${filtered.length} results found`
            : `${filtered.length} of ${results.length} results (HD Video only)`;

    // Clear previous results
    resultsBody.innerHTML = '';

    // Add filtered results
    filtered.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="torrent-name">${escapeHtml(result.name)}</td>
            <td data-size="${result.size}">${formatSize(result.size)}</td>
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
                <div class="detail-value">${parseDetails(details.content) || 'No description available'}</div>
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

// HD Video Filter Management
function toggleHDFilter() {
    hdVideoFilter = !hdVideoFilter;
    
    // Save to localStorage
    localStorage.setItem('hdVideoFilter', JSON.stringify(hdVideoFilter));
    
    // Update UI
    updateHDFilterButton();
    
    // Re-render with filter
    if (searchResults.length > 0) {
        displayResults(searchResults);
    }
}

function updateHDFilterButton() {
    const button = document.getElementById('hdFilterBtn');
    const icon = document.getElementById('hdFilterIcon');
    const text = document.getElementById('hdFilterText');
    
    if (!button) return;
    
    if (hdVideoFilter) {
        button.classList.add('active');
        icon.textContent = '✓';
        text.textContent = 'HD Video Only';
    } else {
        button.classList.remove('active');
        icon.textContent = '🎬';
        text.textContent = 'All Quality';
    }
}

// Theme Management
function initTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggle(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeToggle(theme) {
    const slider = document.querySelector('.theme-toggle-slider');
    if (slider) {
        slider.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

// Search History Management
function saveToHistory(query) {
    const history = getSearchHistory();
    
    // Create history item
    const item = {
        id: Date.now(),
        title: query.title,
        year: query.year,
        season: query.season,
        timestamp: new Date().toISOString()
    };
    
    // Remove duplicates (same title+year+season)
    const filtered = history.filter(h => 
        !(h.title === item.title && h.year === item.year && h.season === item.season)
    );
    
    // Add new item at the beginning
    filtered.unshift(item);
    
    // Keep only MAX_HISTORY_ITEMS
    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
    
    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(trimmed));
    
    // Update UI
    renderSearchHistory();
}

function getSearchHistory() {
    try {
        const history = localStorage.getItem('searchHistory');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error reading search history:', error);
        return [];
    }
}

function deleteHistoryItem(id) {
    const history = getSearchHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem('searchHistory', JSON.stringify(filtered));
    renderSearchHistory();
    showToast('History item removed', 'success');
}

function clearHistory() {
    if (confirm('Clear all search history?')) {
        localStorage.removeItem('searchHistory');
        renderSearchHistory();
        showToast('History cleared', 'success');
    }
}

function renderSearchHistory() {
    const history = getSearchHistory();
    const container = document.getElementById('searchHistory');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="history-header">
            <span class="history-title">Recent Searches</span>
            <button class="btn-link" onclick="clearHistory()">Clear All</button>
        </div>
        <div class="history-items">
            ${history.map(item => `
                <div class="history-chip" onclick='replaySearch(${JSON.stringify(item).replace(/'/g, "&apos;")})' title="Click to search again">
                    <span class="history-text">
                        ${escapeHtml(item.title)}
                        ${item.year ? `<span class="history-meta">${escapeHtml(item.year)}</span>` : ''}
                        ${item.season ? `<span class="history-meta">S${escapeHtml(item.season)}</span>` : ''}
                    </span>
                    <button class="history-remove" onclick="event.stopPropagation(); deleteHistoryItem(${item.id})" title="Remove">
                        ×
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function replaySearch(item) {
    document.getElementById('title').value = item.title;
    document.getElementById('year').value = item.year || '';
    document.getElementById('season').value = item.season || '';
    document.getElementById('searchForm').dispatchEvent(new Event('submit'));
}

// Format size in MB to human-readable format
function formatSize(sizeInMB) {
    if (sizeInMB >= 1024) {
        return parseFloat((sizeInMB / 1024).toFixed(2)) + ' GB';
    }
    return parseFloat(sizeInMB.toFixed(2)) + ' MB';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Parse details content safely
function parseDetails(text) {
    const parsedText = text
        .replace(/\n/g, '<br>')
        .replace(/<br><br>\* \* \*<br><br>/gi, '<hr>')
        .replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>')
        .replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>')
        .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
    return parsedText;
}

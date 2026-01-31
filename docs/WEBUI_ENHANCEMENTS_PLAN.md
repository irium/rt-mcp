# WebUI Enhancements - Implementation Plan

**Date:** January 31, 2026  
**Status:** Planning Phase

## Overview

This document outlines the implementation plan for the next set of WebUI enhancements:
1. Search History (localStorage-based)
2. Category/Forum Filter
3. Pagination
4. Dark Theme + Theme Switcher

---

## Feature 1: Search History 📜

### Objective
Store and display recent searches to allow users to quickly repeat previous searches.

### Technical Approach
- Use **localStorage** to persist search history across sessions
- Store last 10 searches with timestamps
- Display as clickable chips/pills below search form
- Allow clearing individual items or entire history

### Implementation Details

#### 1.1 Frontend Changes

**File: [public/app.js](../public/app.js)**

```javascript
// Add after state declaration
const MAX_HISTORY_ITEMS = 10;

// New functions to add:
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
                <div class="history-chip" onclick='replaySearch(${JSON.stringify(item)})'>
                    <span class="history-text">
                        ${escapeHtml(item.title)}
                        ${item.year ? `<span class="history-meta">${item.year}</span>` : ''}
                        ${item.season ? `<span class="history-meta">S${item.season}</span>` : ''}
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

// Update handleSearch to save history
async function handleSearch(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const year = document.getElementById('year').value.trim();
    const season = document.getElementById('season').value.trim();
    
    if (!title) {
        showToast('Please enter a title', 'error');
        return;
    }

    // ... existing code ...
    
    try {
        const response = await fetch(`${API_BASE}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, year, season }),
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
        }

        const results = await response.json();
        searchResults = results;
        displayResults(results);
        
        // **NEW: Save to history after successful search**
        saveToHistory({ title, year, season });
        
        checkStatus();
    } catch (error) {
        console.error('Search error:', error);
        showToast(error.message, 'error');
    } finally {
        // ... existing code ...
    }
}

// Initialize history on page load
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setupEventListeners();
    renderSearchHistory(); // **NEW**
});
```

**File: [public/index.html](../public/index.html)**

Add after search form, before results section:

```html
<div id="searchHistory" class="search-history" style="display: none;">
    <!-- Populated by JavaScript -->
</div>
```

**File: [public/styles.css](../public/styles.css)**

```css
/* Search History Styles */
.search-history {
    background: var(--bg-primary);
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: var(--shadow);
    margin-bottom: 2rem;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.history-title {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.btn-link {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    text-decoration: underline;
}

.btn-link:hover {
    color: var(--primary-hover);
}

.history-items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.history-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 1.5rem;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
}

.history-chip:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.history-chip:hover .history-remove {
    color: white;
}

.history-text {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.history-meta {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.history-remove {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1.25rem;
    line-height: 1;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.history-remove:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--danger-color);
}
```

#### 1.2 Testing
- Test localStorage limits (should handle gracefully)
- Test with special characters in titles
- Test clear all functionality
- Test duplicate detection

---

## Feature 2: Category/Forum Filter 🎯

### Objective
Allow users to filter results by RuTracker forum categories (Movies, TV Shows, Music, etc.)

### Technical Approach
- Add multi-select dropdown for forum categories
- Filter results on frontend (already fetched)
- Display active filters as removable chips
- Persist selected filters in localStorage

### Implementation Details

#### 2.1 Backend Changes

**File: [src/rutracker/rutracker.controller.ts](../src/rutracker/rutracker.controller.ts)**

Add new endpoint to get available forums:

```typescript
@Get('forums')
async getForums() {
  // Return common RuTracker forum categories
  return {
    forums: [
      { id: 'all', name: 'All Categories', icon: '🌐' },
      { id: '2090', name: 'Movies (HD)', icon: '🎬' },
      { id: '2221', name: 'TV Shows (HD)', icon: '📺' },
      { id: '934', name: 'Foreign Movies', icon: '🎞️' },
      { id: '842', name: 'TV Series', icon: '📼' },
      { id: '2076', name: 'Documentary', icon: '🎥' },
      { id: '1576', name: 'Anime', icon: '🎌' },
      { id: '209', name: 'Music', icon: '🎵' },
    ]
  };
}
```

#### 2.2 Frontend Changes

**File: [public/app.js](../public/app.js)**

```javascript
// Add to state
let activeFilters = {
    forums: [],
    minSeeders: 0,
    maxSize: null
};

// New functions
async function loadForumsList() {
    try {
        const response = await fetch(`${API_BASE}/forums`);
        const data = await response.json();
        renderForumsFilter(data.forums);
    } catch (error) {
        console.error('Failed to load forums:', error);
    }
}

function renderForumsFilter(forums) {
    const container = document.getElementById('forumsFilter');
    container.innerHTML = `
        <div class="filter-dropdown">
            <button class="filter-btn" onclick="toggleForumDropdown()">
                <span>📁 Categories</span>
                ${activeFilters.forums.length > 0 ? `<span class="badge">${activeFilters.forums.length}</span>` : ''}
            </button>
            <div class="dropdown-menu" id="forumDropdown" style="display: none;">
                ${forums.map(forum => `
                    <label class="dropdown-item">
                        <input type="checkbox" value="${forum.id}" 
                            ${activeFilters.forums.includes(forum.id) ? 'checked' : ''}
                            onchange="toggleForumFilter('${forum.id}')">
                        <span>${forum.icon} ${forum.name}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function toggleForumDropdown() {
    const dropdown = document.getElementById('forumDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function toggleForumFilter(forumId) {
    if (forumId === 'all') {
        activeFilters.forums = [];
    } else {
        const index = activeFilters.forums.indexOf(forumId);
        if (index > -1) {
            activeFilters.forums.splice(index, 1);
        } else {
            activeFilters.forums.push(forumId);
        }
    }
    
    // Save to localStorage
    localStorage.setItem('activeFilters', JSON.stringify(activeFilters));
    
    // Re-render with filters
    displayResults(searchResults);
    renderActiveFilters();
}

function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    
    if (activeFilters.forums.length === 0 && !activeFilters.minSeeders) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = activeFilters.forums.map(forumId => `
        <span class="filter-chip">
            ${forumId}
            <button onclick="toggleForumFilter('${forumId}')">×</button>
        </span>
    `).join('');
}

function applyFilters(results) {
    let filtered = [...results];
    
    // Forum filter
    if (activeFilters.forums.length > 0) {
        filtered = filtered.filter(r => 
            activeFilters.forums.some(f => r.forum.includes(f))
        );
    }
    
    // Seeders filter
    if (activeFilters.minSeeders > 0) {
        filtered = filtered.filter(r => r.seeders >= activeFilters.minSeeders);
    }
    
    // Size filter
    if (activeFilters.maxSize) {
        filtered = filtered.filter(r => r.size <= activeFilters.maxSize);
    }
    
    return filtered;
}

// Update displayResults to apply filters
function displayResults(results) {
    const filtered = applyFilters(results);
    
    const resultsSection = document.getElementById('resultsSection');
    const emptyState = document.getElementById('emptyState');
    const resultsBody = document.getElementById('resultsBody');
    const resultsCount = document.getElementById('resultsCount');

    if (filtered.length === 0) {
        resultsSection.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = 
            results.length > 0 
                ? `No results match the selected filters (${results.length} total results)`
                : 'No results found. Try a different search.';
        return;
    }

    // ... rest of existing code, but use 'filtered' instead of 'results' ...
    resultsCount.textContent = 
        filtered.length === results.length 
            ? `${filtered.length} results found`
            : `${filtered.length} of ${results.length} results`;
}

// Load filters from localStorage on init
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setupEventListeners();
    renderSearchHistory();
    loadForumsList(); // **NEW**
    
    // Load saved filters
    const saved = localStorage.getItem('activeFilters');
    if (saved) {
        activeFilters = JSON.parse(saved);
    }
});
```

**File: [public/index.html](../public/index.html)**

Add after search form:

```html
<div class="filters-section">
    <div id="forumsFilter"></div>
    <div id="activeFilters" class="active-filters" style="display: none;"></div>
</div>
```

**File: [public/styles.css](../public/styles.css)**

```css
/* Filters Section */
.filters-section {
    background: var(--bg-primary);
    padding: 1rem 2rem;
    border-radius: 0.75rem;
    box-shadow: var(--shadow);
    margin-bottom: 2rem;
}

.filter-dropdown {
    position: relative;
    display: inline-block;
}

.filter-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.filter-btn:hover {
    background: var(--border-color);
}

.filter-btn .badge {
    background: var(--primary-color);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
    min-width: 250px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 100;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-item:hover {
    background: var(--bg-secondary);
}

.dropdown-item input[type="checkbox"] {
    cursor: pointer;
}

.active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--primary-color);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
}

.filter-chip button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1.125rem;
    line-height: 1;
    padding: 0;
}
```

---

## Feature 3: Pagination 📄

### Objective
Split large result sets into pages to improve performance and usability.

### Technical Approach
- Frontend pagination (results already fetched)
- Show 25 results per page
- Add pagination controls (Previous, Page Numbers, Next)
- Remember current page when filtering

### Implementation Details

#### 3.1 Frontend Changes

**File: [public/app.js](../public/app.js)**

```javascript
// Add to state
const ITEMS_PER_PAGE = 25;
let currentPage = 1;

// New functions
function paginate(items, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        items: items.slice(start, end),
        totalPages: Math.ceil(items.length / perPage),
        currentPage: page,
        totalItems: items.length
    };
}

function renderPagination(totalPages, currentPage) {
    if (totalPages <= 1) {
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    const container = document.getElementById('pagination');
    container.style.display = 'flex';
    
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        // Always show first page
        pages.push(1);
        
        if (currentPage > 3) {
            pages.push('...');
        }
        
        // Show pages around current
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        
        if (currentPage < totalPages - 2) {
            pages.push('...');
        }
        
        // Always show last page
        pages.push(totalPages);
    }
    
    container.innerHTML = `
        <button class="pagination-btn" 
            ${currentPage === 1 ? 'disabled' : ''} 
            onclick="goToPage(${currentPage - 1})">
            ← Previous
        </button>
        ${pages.map(page => 
            page === '...' 
                ? '<span class="pagination-ellipsis">...</span>'
                : `<button class="pagination-btn ${page === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${page})">${page}</button>`
        ).join('')}
        <button class="pagination-btn" 
            ${currentPage === totalPages ? 'disabled' : ''} 
            onclick="goToPage(${currentPage + 1})">
            Next →
        </button>
    `;
}

function goToPage(page) {
    currentPage = page;
    displayResults(searchResults);
    // Scroll to top of results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Update displayResults to use pagination
function displayResults(results) {
    const filtered = applyFilters(results);
    const paginated = paginate(filtered, currentPage, ITEMS_PER_PAGE);
    
    const resultsSection = document.getElementById('resultsSection');
    const emptyState = document.getElementById('emptyState');
    const resultsBody = document.getElementById('resultsBody');
    const resultsCount = document.getElementById('resultsCount');

    if (filtered.length === 0) {
        resultsSection.style.display = 'none';
        emptyState.style.display = 'block';
        // ... existing empty state code ...
        return;
    }

    emptyState.style.display = 'none';
    resultsSection.style.display = 'block';
    
    resultsCount.textContent = 
        `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} results`;

    // Clear previous results
    resultsBody.innerHTML = '';

    // Add paginated results
    paginated.items.forEach(result => {
        // ... existing row rendering code ...
    });
    
    // Render pagination
    renderPagination(paginated.totalPages, currentPage);
}

// Reset to page 1 when searching or filtering
function handleSearch(e) {
    // ... existing code ...
    currentPage = 1; // **ADD THIS**
    // ... rest of code ...
}

function toggleForumFilter(forumId) {
    // ... existing code ...
    currentPage = 1; // **ADD THIS**
    displayResults(searchResults);
}
```

**File: [public/index.html](../public/index.html)**

Add after results table:

```html
<div id="pagination" class="pagination" style="display: none;">
    <!-- Populated by JavaScript -->
</div>
```

**File: [public/styles.css](../public/styles.css)**

```css
/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
    padding: 1rem;
}

.pagination-btn {
    padding: 0.5rem 0.875rem;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
    min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.pagination-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    font-weight: 600;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-ellipsis {
    padding: 0.5rem;
    color: var(--text-secondary);
}
```

---

## Feature 4: Dark Theme + Theme Switcher 🌓

### Objective
Provide a dark color scheme with toggle functionality, persisting user preference.

### Technical Approach
- CSS custom properties for easy theme switching
- Toggle button in header
- localStorage to persist theme preference
- Smooth transition between themes
- System preference detection as default

### Implementation Details

#### 4.1 Frontend Changes

**File: [public/styles.css](../public/styles.css)**

Replace root variables section:

```css
/* Light Theme (Default) */
:root {
    --primary-color: #2563eb;
    --primary-hover: #1d4ed8;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-tertiary: #f3f4f6;
    --border-color: #e5e7eb;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Dark Theme */
[data-theme="dark"] {
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --success-color: #10b981;
    --danger-color: #f87171;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --bg-primary: #1f2937;
    --bg-secondary: #111827;
    --bg-tertiary: #0f172a;
    --border-color: #374151;
    --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

/* Smooth transitions for theme changes */
* {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Prevent transitions on buttons and interactive elements */
button, input, .btn {
    transition: all 0.2s ease;
}
```

Add theme toggle button styles:

```css
/* Theme Toggle */
.theme-toggle {
    position: relative;
    width: 60px;
    height: 30px;
    background: var(--border-color);
    border-radius: 15px;
    cursor: pointer;
    transition: background 0.3s;
    border: none;
    padding: 0;
}

.theme-toggle:hover {
    background: var(--text-secondary);
}

.theme-toggle-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 24px;
    background: var(--bg-primary);
    border-radius: 50%;
    transition: transform 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

[data-theme="dark"] .theme-toggle-slider {
    transform: translateX(30px);
}

.theme-label {
    margin-right: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}
```

**File: [public/app.js](../public/app.js)**

```javascript
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // **NEW: Initialize theme first**
    checkStatus();
    setupEventListeners();
    renderSearchHistory();
    loadForumsList();
    
    // Load saved filters
    const saved = localStorage.getItem('activeFilters');
    if (saved) {
        activeFilters = JSON.parse(saved);
    }
});
```

**File: [public/index.html](../public/index.html)**

Update header section:

```html
<header>
    <h1>🎬 Rutracker Search</h1>
    <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="theme-label">Theme</span>
            <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
                <span class="theme-toggle-slider">☀️</span>
            </button>
        </div>
        <div class="status" id="status">
            <span class="status-indicator" id="statusIndicator"></span>
            <span id="statusText">Checking status...</span>
        </div>
    </div>
</header>
```

---

## Implementation Order

### Phase 1: Foundation (Day 1)
1. **Dark Theme** - Most visual impact, independent of other features
2. **Search History** - Enhances UX without dependencies

### Phase 2: Data Management (Day 2)
3. **Pagination** - Improves performance with large result sets
4. **Category Filter** - Builds on pagination structure

### Testing Checklist
- [ ] Search history persists across browser sessions
- [ ] History shows most recent 10 searches
- [ ] Duplicate searches don't create new history items
- [ ] Theme preference persists across sessions
- [ ] Theme respects system preference on first load
- [ ] Dark theme has proper contrast ratios (WCAG AA)
- [ ] Pagination works with filtered results
- [ ] Pagination resets to page 1 on new search
- [ ] Category filter updates result count correctly
- [ ] Multiple filters can be applied simultaneously

---

## Estimated Time

| Feature | Coding | Testing | Total |
|---------|--------|---------|-------|
| Search History | 2h | 0.5h | 2.5h |
| Category Filter | 3h | 1h | 4h |
| Pagination | 2h | 0.5h | 2.5h |
| Dark Theme | 1.5h | 0.5h | 2h |
| **TOTAL** | **8.5h** | **2.5h** | **11h** |

---

## Future Enhancements (Not in This Phase)

- Advanced filters (size range, date range, minimum seeders)
- Export search results (CSV, JSON)
- Keyboard shortcuts (Enter to search, Esc to close modal)
- Download queue management
- Plex integration indicator
- Mobile app-style PWA support
- Multi-language support (Russian/English toggle)

---

## Notes

- All features use **localStorage** for persistence
- No backend changes needed (except forum list endpoint)
- All enhancements are **progressive** - can be implemented independently
- **Mobile-first** approach maintained throughout
- Features gracefully degrade if localStorage unavailable

---

**Status:** Ready for implementation 🚀

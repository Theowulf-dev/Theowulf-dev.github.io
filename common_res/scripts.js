// Highlight search matches in text
function highlightMatch(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

let currentCategory = null;
let selectedTags = [];

// No contentItems declaration here — use the global one from guides-items.js

// Dynamically create the category folder buttons
function generateCategoryFolders() {
    const foldersDiv = document.querySelector(".folders");
    foldersDiv.innerHTML = ""; // clear any existing folders

    for (const [catKey, catName] of Object.entries(categories)) {
        const folderDiv = document.createElement("div");
        folderDiv.classList.add("folder");
        folderDiv.textContent = catName;
        folderDiv.onclick = () => loadCategory(catKey, folderDiv);
        foldersDiv.appendChild(folderDiv);
    }
}

// Load guides in a selected category and display tags, search etc.
function loadCategory(category, element) {
    selectedTags = [];
    currentCategory = category;

    document.querySelectorAll('.folder').forEach(f => f.classList.remove('active'));
    element.classList.add('active');

    const list = contentItems[category] || [];
    const contentDiv = document.getElementById("content");
    const displayName = element.textContent;

    const uniqueTags = [...new Set(list.flatMap(item => item.tags))].sort();
    const tagsHtml = uniqueTags.map(tag =>
        `<span class="tag" onclick="toggleTag('${tag}', this)">${tag}</span>`
    ).join(' ');

    let html = `
        <div class="content-list">
            <div>
                <h2 style="margin: 0;">${displayName}</h2>
                <div class="search-container" style="width: 250px;">
                    <input type="text" id="categorySearchInput" placeholder="Search in this category..." oninput="searchCategory()" />
                </div>
            </div>
            <div id="tag-filter-container" style="margin-bottom: 1rem;">
                ${tagsHtml}
            </div>
            <div class="card-grid" id="categoryItemsGrid">`;

    list.forEach(item => {
        html += `
            <a href="${item.link}" class="content-card">
                <img src="${item.image}" alt="${item.title}">
                <div class="card-text">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="tags">
                        ${item.tags.map(tag => `<span class="tag${selectedTags.includes(tag) ? ' selected' : ''}">${tag}</span>`).join(' ')}
                    </div>
                </div>
            </a>`;
    });

    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

// Tag toggle for filtering
function toggleTag(tag, element) {
    const index = selectedTags.indexOf(tag);
    if (index === -1) {
        selectedTags.push(tag);
        element.classList.add('selected');
    } else {
        selectedTags.splice(index, 1);
        element.classList.remove('selected');
    }
    searchCategory();
}

// Global search across all categories
function searchAll() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const contentDiv = document.getElementById("content");
    let matches = [];

    if (!query) {
        if (currentCategory) {
            const folderElement = [...document.querySelectorAll('.folder')]
                .find(f => f.textContent === categories[currentCategory]);
            if (folderElement) {
                loadCategory(currentCategory, folderElement);
                return;
            }
        }
        contentDiv.innerHTML = `<p>Select a category to see content.</p>`;
        return;
    }

    for (let category in contentItems) {
        const results = contentItems[category].filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
        matches.push(...results);
    }

    if (matches.length === 0) {
        contentDiv.innerHTML = `<p>No results found.</p>`;
        return;
    }

    let html = `<div class="content-list"><h2>Search Results</h2><div class="card-grid">`;
    matches.forEach(item => {
        html += `
            <a href="${item.link}" class="content-card">
                <img src="${item.image}" alt="${item.title}">
                <div class="card-text">
                    <h3>${highlightMatch(item.title, query)}</h3>
                    <p>${highlightMatch(item.description, query)}</p>
                    <div class="tags">
                        ${item.tags.map(tag => `<span class="tag${selectedTags.includes(tag) ? ' selected' : ''}">${tag}</span>`).join(' ')}
                    </div>
                </div>
            </a>`;
    });
    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

// Search within current category and tag filters
function searchCategory() {
    const query = document.getElementById("categorySearchInput").value.toLowerCase();
    if (!currentCategory) return;

    const list = contentItems[currentCategory] || [];
    const gridDiv = document.getElementById("categoryItemsGrid");

    const filtered = list.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item.tags.includes(tag));
        return matchesSearch && matchesTags;
    });

    if (filtered.length === 0) {
        gridDiv.innerHTML = `<p>No results found in this category.</p>`;
        return;
    }

    let html = '';
    filtered.forEach(item => {
        html += `
            <a href="${item.link}" class="content-card">
                <img src="${item.image}" alt="${item.title}">
                <div class="card-text">
                    <h3>${highlightMatch(item.title, query)}</h3>
                    <p>${highlightMatch(item.description, query)}</p>
                    <div class="tags">
                        ${item.tags.map(tag => `<span class="tag${selectedTags.includes(tag) ? ' selected' : ''}">${tag}</span>`).join(' ')}
                    </div>
                </div>
            </a>`;
    });
    gridDiv.innerHTML = html;
}

// Initialize the page once contentItems and categories are loaded
function init() {
    generateCategoryFolders();
}

// New function to load individual item based on page filename
function loadItemFromPage() {
    const fileName = window.location.pathname.split("/").pop().replace(".html", "");
    const allItems = Object.values(contentItems).flat();
    const item = allItems.find(i => i.id === fileName);

    if (!item) return;

    document.title = `${item.title} | Skyrim AE Modding Hub`;
    const titleEl = document.getElementById("item-title");
    if (titleEl) titleEl.textContent = item.title;

const img = document.getElementById("item-image");
if (img) {
    let path = item.image;
    
    if (path.startsWith("items/")) { // checks for dubling of "items/items" in path
        path = path.substring("items/".length);  // remove the first "items/"
    }

    img.src = path;
    img.alt = item.title;
    img.style.display = "block";
}
    const tagContainer = document.getElementById("item-tags");
    if (tagContainer) {
        tagContainer.innerHTML = ""; // clear existing tags
        item.tags.forEach(tag => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = tag;
            tagContainer.appendChild(span);
        });
    }
}

// Run init on window load and load item on DOMContentLoaded
window.onload = () => {
    init();
};

document.addEventListener("DOMContentLoaded", loadItemFromPage);

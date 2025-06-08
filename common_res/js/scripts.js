const contentItems = {
    lokirstomb: [
        {
            title: "Landscape Basics",
            link: "#",
            image: "https://via.placeholder.com/400x200?text=Landscape+Basics",
            description: "Learn how to sculpt terrain and apply textures.",
            tags: ["landscape", "terrain", "basics"]
        },
        {
            title: "Clutter Placement",
            link: "#",
            image: "https://via.placeholder.com/400x200?text=Clutter+Placement",
            description: "Place immersive objects to bring your world to life.",
            tags: ["clutter", "placement"]
        },
        {
            title: "Navmesh Intro",
            link: "#",
            image: "https://via.placeholder.com/400x200?text=Navmesh+Intro",
            description: "Guide AI with custom navigation meshes.",
            tags: ["navmesh", "AI", "navigation"]
        }
    ]
};

function highlightMatch(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

let currentCategory = null;
let selectedTags = [];

function loadCategory(category, element) {
    selectedTags = [];
    currentCategory = category;

    document.querySelectorAll('.folder').forEach(f => f.classList.remove('active'));
    element.classList.add('active');

    const list = contentItems[category];
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

function searchAll() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const contentDiv = document.getElementById("content");
    let matches = [];

    if (!query) {
        if (currentCategory) {
            const folderElement = [...document.querySelectorAll('.folder')]
                .find(f => f.getAttribute('onclick')?.includes(`'${currentCategory}'`));
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

function searchCategory() {
    const query = document.getElementById("categorySearchInput").value.toLowerCase();
    if (!currentCategory) return;

    const list = contentItems[currentCategory];
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

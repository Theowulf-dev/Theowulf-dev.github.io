// scripts.js

const tutorials = {
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

    const list = tutorials[category];
    const contentDiv = document.getElementById("content");
    const displayName = element.textContent;

    const uniqueTags = [...new Set(list.flatMap(tut => tut.tags))].sort();
    const tagsHtml = uniqueTags.map(tag =>
        `<span class="tag" onclick="toggleTag('${tag}', this)">${tag}</span>`
    ).join(' ');

    let html = `
        <div class="tutorial-list">
            <div>
                <h2 style="margin: 0;">${displayName} Tutorials</h2>
                <div class="search-container" style="width: 250px;">
                    <input type="text" id="categorySearchInput" placeholder="Search in this category..." oninput="searchCategoryTutorials()" />
                </div>
            </div>
            <div id="tag-filter-container" style="margin-bottom: 1rem;">
                ${tagsHtml}
            </div>
            <div class="card-grid" id="categoryTutorialsGrid">`;

    list.forEach(tut => {
        html += `
            <a href="${tut.link}" class="tutorial-card">
                <img src="${tut.image}" alt="${tut.title}">
                <div class="card-text">
                    <h3>${tut.title}</h3>
                    <p>${tut.description}</p>
                    <div class="tags">
                        ${tut.tags.map(tag => `<span class="tag${selectedTags.includes(tag) ? ' selected' : ''}">${tag}</span>`).join(' ')}
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
    searchCategoryTutorials();
}

function searchTutorials() {
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
        contentDiv.innerHTML = `<p>Select a category to see tutorials.</p>`;
        return;
    }

    for (let category in tutorials) {
        const results = tutorials[category].filter(tut =>
            tut.title.toLowerCase().includes(query) ||
            tut.description.toLowerCase().includes(query)
        );
        matches.push(...results);
    }

    if (matches.length === 0) {
        contentDiv.innerHTML = `<p>No results found.</p>`;
        return;
    }

    let html = `<div class="tutorial-list"><h2>Search Results</h2><div class="card-grid">`;
    matches.forEach(tut => {
        html += `
            <a href="${tut.link}" class="tutorial-card">
                <img src="${tut.image}" alt="${tut.title}">
                <div class="card-text">
                    <h3>${highlightMatch(tut.title, query)}</h3>
                    <p>${highlightMatch(tut.description, query)}</p>
                    <div class="tags">
                        ${tut.tags.map(tag => `<span class="tag${selectedTags.includes(tag) ? ' selected' : ''}">${tag}</span>`).join(' ')}
                    </div>
                </div>
            </a>`;
    });
    html += `</div></div>`;
    contentDiv.innerHTML = html;
}

function searchCategoryTutorials() {
    const query = document.getElementById("categorySearchInput").value.toLowerCase();
    if (!currentCategory) return;

    const list = tutorials[currentCategory];
    const gridDiv = document.getElementById("categoryTutorialsGrid");

    const filtered = list.filter(tut => {
        const matchesSearch = tut.title.toLowerCase().includes(query) || tut.description.toLowerCase().includes(query);
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => tut.tags.includes(tag));
        return matchesSearch && matchesTags;
    });

    if (filtered.length === 0) {
        gridDiv.innerHTML = `<p>No results found in this category.</p>`;
        return;
    }

    let html = '';
    filtered.forEach(tut => {
        html += `
            <a href="${tut.link}" class="tutorial-card">
                <img src="${tut.image}" alt="${tut.title}">
                <div class="card-text">
                    <h3>${highlightMatch(tut.title, query)}</h3>
                    <p>${highlightMatch(tut.description, query)}</p>
                    <div class="tags">
                        ${tut.tags.map(tag => `<span class="tag${selectedTags.includes(tag) ? ' selected' : ''}">${tag}</span>`).join(' ')}
                    </div>
                </div>
            </a>`;
    });
    gridDiv.innerHTML = html;
}

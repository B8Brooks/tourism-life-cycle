// ===== TALC Tourism Analyzer - Main JavaScript =====

// Stage colors matching CSS
const stageColors = {
    exploration: '#3498db',
    involvement: '#f1c40f',
    development: '#2ecc71',
    consolidation: '#e74c3c',
    stagnation: '#9b59b6',
    decline: '#7f8c8d',
    rejuvenation: '#e67e22'
};

// Stage descriptions for modal
const stageDescriptions = {
    exploration: 'This destination is in the Exploration stage - characterized by small numbers of adventurous tourists, minimal infrastructure, and high authenticity. Visitors typically have significant contact with local communities.',
    involvement: 'This destination is in the Involvement stage - local residents are beginning to provide facilities for tourists, a tourism season may be emerging, and the community is recognizing tourism\'s economic potential.',
    development: 'This destination is in the Development stage - experiencing rapid growth with large numbers of tourists during peak periods, significant external investment, and major changes to the area\'s character.',
    consolidation: 'This destination is in the Consolidation stage - tourism is a major part of the local economy, growth rates are declining but total numbers remain high, and major franchises and chains are present.',
    stagnation: 'This destination is in the Stagnation stage - peak visitor numbers have been reached, the destination may no longer be fashionable, and environmental, social, and economic problems may be evident.',
    decline: 'This destination is in the Decline stage - visitors are being lost to newer destinations, tourist facilities may be converted for other uses, and the area may be exiting tourism altogether.',
    rejuvenation: 'This destination is in the Rejuvenation stage - through significant changes, new attractions, or repositioning, the destination is experiencing renewed growth and sustainable development.'
};

// Stage characteristics for enhanced modal
const stageCharacteristics = {
    exploration: {
        indicators: ['Few tourists', 'No dedicated infrastructure', 'High authenticity', 'Local culture intact'],
        travelerTips: 'Expect basic facilities and limited tourist services. Ideal for adventurous travelers seeking authentic experiences.',
        infrastructure: 'Minimal',
        crowding: 'Very Low',
        authenticity: 'Very High',
        priceLevel: 'Variable'
    },
    involvement: {
        indicators: ['Growing awareness', 'Local entrepreneurs emerging', 'Basic facilities', 'Tourism season forming'],
        travelerTips: 'Good balance of authenticity and basic comfort. Local guides and family-run accommodations offer genuine experiences.',
        infrastructure: 'Basic',
        crowding: 'Low',
        authenticity: 'High',
        priceLevel: 'Budget-Moderate'
    },
    development: {
        indicators: ['Rapid growth', 'External investment', 'New hotels/resorts', 'Infrastructure expansion'],
        travelerTips: 'Visit soon to experience the destination before mass tourism fully develops. Good value with improving infrastructure.',
        infrastructure: 'Developing',
        crowding: 'Moderate',
        authenticity: 'Moderate',
        priceLevel: 'Moderate'
    },
    consolidation: {
        indicators: ['Tourism-dependent economy', 'International chains', 'Well-developed infrastructure', 'Slowing growth'],
        travelerTips: 'Established destination with reliable services. May feel touristy in popular areas. Look for local neighborhoods.',
        infrastructure: 'Well-Developed',
        crowding: 'High',
        authenticity: 'Low-Moderate',
        priceLevel: 'Moderate-High'
    },
    stagnation: {
        indicators: ['Peak capacity reached', 'Environmental strain', 'Social tensions', 'Outdated facilities'],
        travelerTips: 'May feel overcrowded. Consider shoulder seasons or lesser-known areas within the destination.',
        infrastructure: 'Mature/Aging',
        crowding: 'Very High',
        authenticity: 'Low',
        priceLevel: 'High'
    },
    decline: {
        indicators: ['Falling visitor numbers', 'Facility closures', 'Economic challenges', 'Reputation issues'],
        travelerTips: 'Can offer good value and fewer crowds. Some facilities may be closed or poorly maintained.',
        infrastructure: 'Declining',
        crowding: 'Decreasing',
        authenticity: 'Variable',
        priceLevel: 'Lower'
    },
    rejuvenation: {
        indicators: ['New attractions', 'Rebranding efforts', 'Sustainable initiatives', 'Renewed investment'],
        travelerTips: 'Exciting time to visit as destination reinvents itself. Often good value with new experiences emerging.',
        infrastructure: 'Improving',
        crowding: 'Moderate',
        authenticity: 'Rebuilding',
        priceLevel: 'Variable'
    }
};

// Map destinations to related case studies
const destinationCaseStudies = {
    'albania': 'albania',
    'tirana': 'albania',
    'sarande': 'albania',
    'ksamil': 'albania',
    'berat': 'albania',
    'gjirokaster': 'albania',
    'venice': 'venice',
    'iceland': 'iceland',
    'reykjavik': 'iceland',
    'blue lagoon': 'iceland',
    'maldives': 'maldives',
    'male': 'maldives',
    'maafushi': 'maldives',
    'belize': 'belize',
    'ambergris caye': 'belize',
    'caye caulker': 'belize',
    'hopkins': 'belize',
    'placencia': 'belize',
    'rwanda': 'rwanda',
    'kigali': 'rwanda',
    'volcanoes national park': 'rwanda'
};

// Global variables
let map;
let allMarkers = [];
let allDestinations = [];
let addedDestinations = new Set();
let stageDistributionChart = null;
let regionalDistributionChart = null;
let currentYear = 2024;
let watchList = [];

// Year to column mapping for historical data
const yearToColumn = {
    1980: 'stage_1980',
    1990: 'stage_1990',
    2000: 'stage_2000',
    2010: 'stage_2010',
    2020: 'stage_2020',
    2024: 'phase' // Current stage
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadDestinations();
    initHeroChart();
    initTALCCurve();
    loadWatchList();
});

// Initialize Leaflet map
function initMap() {
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
}

// Create circle markers with stage-specific colors
// Countries get larger markers with a border ring
function createMarker(lat, lng, phase, type) {
    const color = stageColors[phase.toLowerCase()] || '#95a5a6';
    const isCountry = type === 'country';

    if (isCountry) {
        // Country marker: larger with double ring
        return L.circleMarker([lat, lng], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
            className: 'country-marker'
        });
    } else {
        // Location marker: smaller standard circle
        return L.circleMarker([lat, lng], {
            radius: 7,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
}

// Load and parse destinations from CSV
function loadDestinations() {
    fetch('destinations.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    processDestinations(results.data);
                }
            });
        })
        .catch(error => {
            console.error('Error loading destinations:', error);
        });
}

// Process and display destinations
function processDestinations(data) {
    // First pass: collect all country entries for parent lookup
    const countryData = {};
    data.forEach(dest => {
        if (dest.type === 'country') {
            countryData[dest.name] = dest;
        }
    });

    data.forEach(dest => {
        if (!dest.name || !dest.latitude || !dest.longitude || !dest.phase) return;

        const uniqueKey = dest.name.toLowerCase().trim() + '_' + (dest.type || 'location');

        if (addedDestinations.has(uniqueKey)) return;
        addedDestinations.add(uniqueKey);

        const lat = parseFloat(dest.latitude);
        const lng = parseFloat(dest.longitude);
        const phase = dest.phase.trim();
        const country = dest.country || 'Unknown';
        const type = dest.type || 'location';
        const parent = dest.parent || '';
        const justification = dest.justification || '';

        if (isNaN(lat) || isNaN(lng)) return;

        const marker = createMarker(lat, lng, phase, type);

        // Build popup content
        const typeLabel = type === 'country' ? '(Country)' : '';
        const parentInfo = parent ? `<p class="popup-parent">Part of: <strong>${parent}</strong></p>` : '';

        // For countries, show how many locations are within
        let locationCount = '';
        if (type === 'country') {
            const childCount = data.filter(d => d.parent === dest.name).length;
            if (childCount > 0) {
                locationCount = `<p class="popup-locations">${childCount} locations tracked</p>`;
            }
        }

        // Escape justification for use in onclick
        const escapedJustification = justification.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const popupContent = `
            <div class="popup-content">
                <h3>${dest.name} ${typeLabel}</h3>
                <p class="popup-country">${country}</p>
                ${parentInfo}
                <span class="popup-phase ${phase.toLowerCase()}">${phase} Stage</span>
                ${locationCount}
                <p class="popup-details" onclick="showDestinationDetails('${dest.name.replace(/'/g, "\\'")}', '${country.replace(/'/g, "\\'")}', '${phase}', ${lat}, ${lng}, '${type}', '${parent.replace(/'/g, "\\'")}', '${escapedJustification}')">View Details</p>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);

        // For country markers, add click to zoom
        if (type === 'country') {
            marker.on('click', function(e) {
                map.setView([lat, lng], 7);
            });
        }

        const destData = {
            marker: marker,
            name: dest.name.toLowerCase(),
            displayName: dest.name,
            phase: phase.toLowerCase(),
            displayPhase: phase,
            country: country.toLowerCase(),
            displayCountry: country,
            latitude: lat,
            longitude: lng,
            type: type,
            parent: parent.toLowerCase(),
            justification: justification,
            // Historical stage data
            stage_1980: (dest.stage_1980 || '').toLowerCase().trim(),
            stage_1990: (dest.stage_1990 || '').toLowerCase().trim(),
            stage_2000: (dest.stage_2000 || '').toLowerCase().trim(),
            stage_2010: (dest.stage_2010 || '').toLowerCase().trim(),
            stage_2020: (dest.stage_2020 || '').toLowerCase().trim(),
            hasHistoricalData: !!(dest.stage_1980 || dest.stage_1990 || dest.stage_2000 || dest.stage_2010 || dest.stage_2020)
        };

        allMarkers.push(destData);
        allDestinations.push(destData);
    });

    updateStats();
    initCharts();
    generateInsights();
}

// Unified filter function
function applyFilters() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const selectedPhase = document.getElementById('phaseFilter').value.toLowerCase();
    const selectedType = document.getElementById('typeFilter').value.toLowerCase();
    let visibleCount = 0;

    allMarkers.forEach(dest => {
        const matchesSearch = dest.name.includes(searchInput) ||
                              dest.country.includes(searchInput) ||
                              dest.parent.includes(searchInput);
        const matchesPhase = selectedPhase === 'all' || dest.phase === selectedPhase;
        const matchesType = selectedType === 'all' || dest.type === selectedType;

        if (matchesSearch && matchesPhase && matchesType) {
            if (!map.hasLayer(dest.marker)) {
                dest.marker.addTo(map);
            }
            visibleCount++;
        } else {
            map.removeLayer(dest.marker);
        }
    });

    document.getElementById('visibleDestinations').textContent = visibleCount;
}

// Search destinations (calls unified filter)
function searchDestinations() {
    applyFilters();
}

// ===== AUTOCOMPLETE FUNCTIONALITY =====

// Handle search input with autocomplete
function handleSearchInput() {
    const input = document.getElementById('searchInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    const query = input.value.toLowerCase().trim();

    // Also filter the map
    applyFilters();

    // Show autocomplete if there's input
    if (query.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    // Find matching destinations
    const matches = allDestinations
        .filter(d =>
            d.name.includes(query) ||
            d.displayName.toLowerCase().includes(query) ||
            d.country.includes(query) ||
            d.displayCountry.toLowerCase().includes(query)
        )
        .slice(0, 8); // Limit to 8 suggestions

    if (matches.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }

    // Build dropdown HTML
    dropdown.innerHTML = matches.map(d => `
        <div class="autocomplete-item" onclick="selectAutocomplete('${d.displayName.replace(/'/g, "\\'")}', ${d.latitude}, ${d.longitude})">
            <span class="autocomplete-name">${highlightMatch(d.displayName, query)}</span>
            <span class="autocomplete-country">${d.displayCountry}</span>
            <span class="autocomplete-phase ${d.phase}">${d.displayPhase}</span>
        </div>
    `).join('');

    dropdown.classList.remove('hidden');
}

// Highlight matching text in autocomplete
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

// Select autocomplete suggestion
function selectAutocomplete(name, lat, lng) {
    const dropdown = document.getElementById('autocompleteDropdown');
    const input = document.getElementById('searchInput');

    input.value = name;
    dropdown.classList.add('hidden');

    // Zoom to destination and open popup
    map.setView([lat, lng], 10);

    // Find and open the marker popup
    const dest = allDestinations.find(d => d.displayName === name);
    if (dest) {
        dest.marker.openPopup();
    }

    applyFilters();
}

// Close autocomplete when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('autocompleteDropdown');
    const searchWrapper = document.querySelector('.search-wrapper');

    if (dropdown && searchWrapper && !searchWrapper.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// Handle keyboard navigation in autocomplete
document.addEventListener('keydown', function(e) {
    const dropdown = document.getElementById('autocompleteDropdown');
    if (!dropdown || dropdown.classList.contains('hidden')) return;

    const items = dropdown.querySelectorAll('.autocomplete-item');
    const active = dropdown.querySelector('.autocomplete-item.active');
    let index = Array.from(items).indexOf(active);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        index = (index + 1) % items.length;
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (active) active.classList.remove('active');
        index = index <= 0 ? items.length - 1 : index - 1;
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && active) {
        e.preventDefault();
        active.click();
    } else if (e.key === 'Escape') {
        dropdown.classList.add('hidden');
    }
});

// Filter by phase (calls unified filter)
function filterByPhase() {
    applyFilters();
}

// Quick filter from legend click
function quickFilter(phase) {
    document.getElementById('phaseFilter').value = phase;
    document.getElementById('searchInput').value = '';
    applyFilters();
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('phaseFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';

    allMarkers.forEach(dest => {
        if (!map.hasLayer(dest.marker)) {
            dest.marker.addTo(map);
        }
    });

    document.getElementById('visibleDestinations').textContent = allMarkers.length;
    map.setView([20, 0], 2);
}

// Update statistics
function updateStats() {
    const totalDestinations = allMarkers.length;
    const countries = new Set(allMarkers.map(d => d.country));
    const countryEntries = allMarkers.filter(d => d.type === 'country').length;

    document.getElementById('totalDestinations').textContent = totalDestinations;
    document.getElementById('visibleDestinations').textContent = totalDestinations;
    document.getElementById('countriesCount').textContent = countries.size;
}

// Show destination details in modal
function showDestinationDetails(name, country, phase, lat, lng, type, parent, justification = '') {
    const modal = document.getElementById('destinationModal');
    const modalBody = document.getElementById('modalBody');
    const phaseLower = phase.toLowerCase();
    const description = stageDescriptions[phaseLower] || 'Information not available for this stage.';

    // Decode HTML entities in justification
    const decodedJustification = justification.replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const typeLabel = type === 'country' ? '<span class="type-badge country">Country-Level</span>' : '<span class="type-badge location">Location</span>';
    const parentInfo = parent ? `<p class="modal-parent">Part of: <strong>${parent}</strong></p>` : '';

    // Check if in watch list
    const inWatchList = isInWatchList(name, type);
    const watchBtnClass = inWatchList ? 'active' : '';
    const watchBtnText = inWatchList ? 'Remove from Watch List' : 'Add to Watch List';

    // Build justification section if available
    const justificationSection = decodedJustification ? `
        <div class="modal-justification">
            <h4>Why ${phase} Stage?</h4>
            <p>${decodedJustification}</p>
        </div>
    ` : '';

    // Find child locations if this is a country
    let childLocations = '';
    if (type === 'country') {
        const children = allDestinations.filter(d => d.parent.toLowerCase() === name.toLowerCase());
        if (children.length > 0) {
            childLocations = `
                <div class="modal-children">
                    <h4>Locations in ${name}:</h4>
                    <ul>
                        ${children.map(c => {
                            const childJustification = (c.justification || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                            return `
                            <li class="clickable-location" onclick="showDestinationDetails('${c.displayName.replace(/'/g, "\\'")}', '${c.displayCountry.replace(/'/g, "\\'")}', '${c.displayPhase}', ${c.latitude}, ${c.longitude}, '${c.type}', '${c.parent.replace(/'/g, "\\'")}', '${childJustification}')">
                                <span class="child-name">${c.displayName}</span>
                                <span class="child-phase ${c.phase}">${c.displayPhase}</span>
                            </li>
                        `}).join('')}
                    </ul>
                </div>
            `;
        }
    }

    // Get similar destinations
    const similarSection = getSimilarDestinationsHTML(name, phase, country, type);

    // Get stage characteristics
    const characteristics = stageCharacteristics[phaseLower] || {};

    // Build characteristics section
    const characteristicsSection = characteristics.indicators ? `
        <div class="modal-characteristics">
            <h4>Stage Characteristics</h4>
            <div class="characteristics-grid">
                <div class="characteristic-item">
                    <span class="char-label">Infrastructure</span>
                    <span class="char-value">${characteristics.infrastructure || 'N/A'}</span>
                </div>
                <div class="characteristic-item">
                    <span class="char-label">Crowding Level</span>
                    <span class="char-value">${characteristics.crowding || 'N/A'}</span>
                </div>
                <div class="characteristic-item">
                    <span class="char-label">Authenticity</span>
                    <span class="char-value">${characteristics.authenticity || 'N/A'}</span>
                </div>
                <div class="characteristic-item">
                    <span class="char-label">Price Level</span>
                    <span class="char-value">${characteristics.priceLevel || 'N/A'}</span>
                </div>
            </div>
            <div class="stage-indicators">
                <strong>Key Indicators:</strong>
                <ul>
                    ${characteristics.indicators.map(ind => `<li>${ind}</li>`).join('')}
                </ul>
            </div>
        </div>
    ` : '';

    // Build traveler tips section
    const travelerTipsSection = characteristics.travelerTips ? `
        <div class="modal-traveler-tips">
            <h4>For Travelers</h4>
            <p>${characteristics.travelerTips}</p>
        </div>
    ` : '';

    // Check for related case study
    const relatedCaseStudy = destinationCaseStudies[name.toLowerCase()];
    const caseStudySection = relatedCaseStudy ? `
        <div class="modal-case-study-link">
            <button onclick="closeModal(); setTimeout(() => openCaseStudy('${relatedCaseStudy}'), 300);">
                📖 Read ${caseStudies[relatedCaseStudy]?.title || 'Case Study'}
            </button>
        </div>
    ` : '';

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${name}</h2>
            <button class="watch-list-star ${watchBtnClass}" onclick="addToWatchList('${name.replace(/'/g, "\\'")}', '${country.replace(/'/g, "\\'")}', '${phase}', ${lat}, ${lng}, '${type}')" title="${watchBtnText}">
                &#9733;
            </button>
            <p class="country">${country}</p>
            ${typeLabel}
            ${parentInfo}
        </div>
        <div class="modal-stage">
            <span class="stage-badge ${phaseLower}">${phase} Stage</span>
            <p>${description}</p>
        </div>
        ${characteristicsSection}
        ${travelerTipsSection}
        ${justificationSection}
        ${caseStudySection}
        ${childLocations}
        ${similarSection}
        <div class="modal-coordinates">
            <strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
    `;

    modal.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('destinationModal').classList.remove('active');
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('destinationModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Initialize Hero Chart (small TALC curve preview)
function initHeroChart() {
    const ctx = document.getElementById('heroChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Exploration', 'Involvement', 'Development', 'Consolidation', 'Stagnation', '', ''],
            datasets: [
                {
                    label: 'Rejuvenation',
                    data: [null, null, null, null, 95, 110, 130],
                    borderColor: stageColors.rejuvenation,
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'Decline',
                    data: [null, null, null, null, 95, 70, 40],
                    borderColor: stageColors.decline,
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'TALC Curve',
                    data: [10, 25, 55, 85, 95, null, null],
                    borderColor: '#fff',
                    borderWidth: 4,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: [
                        stageColors.exploration,
                        stageColors.involvement,
                        stageColors.development,
                        stageColors.consolidation,
                        stageColors.stagnation
                    ],
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    min: 0,
                    max: 150
                }
            }
        }
    });
}

// Initialize main TALC Curve visualization
function initTALCCurve() {
    const ctx = document.getElementById('talcCurve');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Exploration', 'Involvement', 'Development', 'Consolidation', 'Stagnation', 'Post-Stagnation', 'Future'],
            datasets: [
                {
                    label: 'Rejuvenation Path',
                    data: [null, null, null, null, 95, 110, 130],
                    borderColor: stageColors.rejuvenation,
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 3,
                    borderDash: [8, 4],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: stageColors.rejuvenation
                },
                {
                    label: 'Decline Path',
                    data: [null, null, null, null, 95, 70, 40],
                    borderColor: stageColors.decline,
                    backgroundColor: 'rgba(127, 140, 141, 0.1)',
                    borderWidth: 3,
                    borderDash: [8, 4],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: stageColors.decline
                },
                {
                    label: 'Tourism Development Curve',
                    data: [10, 25, 55, 85, 95, null, null],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: [
                        stageColors.exploration,
                        stageColors.involvement,
                        stageColors.development,
                        stageColors.consolidation,
                        stageColors.stagnation
                    ],
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 10,
                    pointHoverRadius: 14
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const labels = {
                                0: 'Few tourists, minimal infrastructure',
                                1: 'Local involvement begins',
                                2: 'Rapid growth and investment',
                                3: 'Tourism dominates economy',
                                4: 'Peak capacity reached'
                            };
                            if (context.datasetIndex === 2 && labels[context.dataIndex]) {
                                return labels[context.dataIndex];
                            }
                            return context.dataset.label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Tourists',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 150,
                    ticks: {
                        display: false
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Initialize analysis charts
function initCharts() {
    initStageDistributionChart();
    initRegionalDistributionChart();
}

// Stage distribution pie/doughnut chart
function initStageDistributionChart() {
    const ctx = document.getElementById('stageDistribution');
    if (!ctx) return;

    const stageCounts = {};
    Object.keys(stageColors).forEach(stage => {
        stageCounts[stage] = 0;
    });

    allDestinations.forEach(dest => {
        const phase = dest.phase.toLowerCase();
        if (stageCounts.hasOwnProperty(phase)) {
            stageCounts[phase]++;
        }
    });

    const labels = Object.keys(stageCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const data = Object.values(stageCounts);
    const colors = Object.keys(stageCounts).map(s => stageColors[s]);

    if (stageDistributionChart) {
        stageDistributionChart.destroy();
    }

    stageDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Regional distribution bar chart
function initRegionalDistributionChart() {
    const ctx = document.getElementById('regionalDistribution');
    if (!ctx) return;

    // Define regions based on country
    const regionMapping = {
        'europe': ['france', 'germany', 'italy', 'spain', 'portugal', 'uk', 'united kingdom', 'netherlands', 'belgium', 'austria', 'switzerland', 'greece', 'czech republic', 'poland', 'hungary', 'croatia', 'ireland', 'denmark', 'sweden', 'norway', 'finland', 'russia', 'ukraine', 'romania', 'bulgaria', 'serbia', 'montenegro', 'albania', 'north macedonia', 'bosnia and herzegovina', 'slovenia', 'slovakia', 'latvia', 'lithuania', 'estonia', 'malta', 'cyprus', 'iceland', 'monaco', 'luxembourg', 'liechtenstein', 'andorra', 'san marino', 'vatican city', 'moldova', 'belarus', 'kosovo', 'georgia'],
        'asia': ['china', 'japan', 'south korea', 'india', 'thailand', 'vietnam', 'indonesia', 'malaysia', 'philippines', 'singapore', 'hong kong', 'taiwan', 'myanmar', 'cambodia', 'laos', 'nepal', 'sri lanka', 'bangladesh', 'pakistan', 'mongolia', 'bhutan', 'maldives', 'brunei', 'timor-leste', 'macau'],
        'middle east': ['uae', 'united arab emirates', 'qatar', 'saudi arabia', 'oman', 'bahrain', 'kuwait', 'israel', 'jordan', 'lebanon', 'turkey', 'iran', 'iraq', 'syria', 'yemen', 'palestine'],
        'africa': ['south africa', 'egypt', 'morocco', 'kenya', 'tanzania', 'ethiopia', 'nigeria', 'ghana', 'senegal', 'tunisia', 'madagascar', 'namibia', 'botswana', 'zimbabwe', 'zambia', 'mozambique', 'rwanda', 'uganda', 'mauritius', 'seychelles'],
        'north america': ['usa', 'united states', 'canada', 'mexico', 'puerto rico'],
        'central america': ['belize', 'guatemala', 'honduras', 'el salvador', 'nicaragua', 'costa rica', 'panama'],
        'south america': ['brazil', 'argentina', 'chile', 'peru', 'colombia', 'ecuador', 'bolivia', 'uruguay', 'paraguay', 'venezuela', 'guyana', 'suriname'],
        'oceania': ['australia', 'new zealand', 'fiji', 'papua new guinea', 'samoa', 'tonga', 'vanuatu', 'solomon islands', 'palau', 'micronesia'],
        'caribbean': ['jamaica', 'cuba', 'dominican republic', 'bahamas', 'barbados', 'trinidad and tobago', 'haiti', 'aruba', 'cayman islands', 'bermuda', 'antigua', 'st. lucia', 'grenada']
    };

    const regionCounts = {};
    Object.keys(regionMapping).forEach(region => {
        regionCounts[region] = 0;
    });
    regionCounts['other'] = 0;

    allDestinations.forEach(dest => {
        const country = dest.country.toLowerCase();
        let found = false;

        for (const [region, countries] of Object.entries(regionMapping)) {
            if (countries.some(c => country.includes(c) || c.includes(country))) {
                regionCounts[region]++;
                found = true;
                break;
            }
        }

        if (!found) {
            regionCounts['other']++;
        }
    });

    // Filter out regions with 0 destinations and sort
    const sortedRegions = Object.entries(regionCounts)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    const labels = sortedRegions.map(([region]) =>
        region.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    );
    const data = sortedRegions.map(([_, count]) => count);

    const barColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f1c40f',
        '#9b59b6', '#e67e22', '#1abc9c', '#34495e', '#95a5a6', '#16a085'
    ];

    if (regionalDistributionChart) {
        regionalDistributionChart.destroy();
    }

    regionalDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Destinations',
                data: data,
                backgroundColor: barColors.slice(0, labels.length),
                borderColor: barColors.slice(0, labels.length).map(c => c),
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 50
                    }
                }
            }
        }
    });
}

// Generate insights based on data
function generateInsights() {
    const insightsGrid = document.getElementById('insightsGrid');
    if (!insightsGrid) return;

    // Calculate insights
    const stageCounts = {};
    Object.keys(stageColors).forEach(stage => {
        stageCounts[stage] = 0;
    });
    allDestinations.forEach(dest => {
        const phase = dest.phase.toLowerCase();
        if (stageCounts.hasOwnProperty(phase)) {
            stageCounts[phase]++;
        }
    });

    // Find dominant stage
    const dominantStage = Object.entries(stageCounts).reduce((a, b) => a[1] > b[1] ? a : b);

    // Calculate early stage percentage (exploration + involvement)
    const earlyStage = (stageCounts.exploration + stageCounts.involvement);
    const earlyStagePercent = ((earlyStage / allDestinations.length) * 100).toFixed(1);

    // Calculate mature stage percentage (consolidation + stagnation)
    const matureStage = (stageCounts.consolidation + stageCounts.stagnation);
    const matureStagePercent = ((matureStage / allDestinations.length) * 100).toFixed(1);

    // Country vs location count
    const countryCount = allDestinations.filter(d => d.type === 'country').length;
    const locationCount = allDestinations.filter(d => d.type === 'location').length;

    const insights = [
        {
            title: 'Dominant Stage',
            value: dominantStage[0].charAt(0).toUpperCase() + dominantStage[0].slice(1),
            description: `${dominantStage[1]} destinations are in this stage`
        },
        {
            title: 'Emerging Destinations',
            value: `${earlyStagePercent}%`,
            description: 'In Exploration or Involvement stages'
        },
        {
            title: 'Mature Markets',
            value: `${matureStagePercent}%`,
            description: 'In Consolidation or Stagnation stages'
        },
        {
            title: 'Data Coverage',
            value: `${countryCount} countries`,
            description: `${locationCount} specific locations tracked`
        }
    ];

    insightsGrid.innerHTML = insights.map(insight => `
        <div class="insight-card">
            <h4>${insight.title}</h4>
            <p><span class="highlight">${insight.value}</span></p>
            <p>${insight.description}</p>
        </div>
    `).join('');
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll-based header shadow
window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }
});

// ===== TIME SLIDER FUNCTIONALITY =====

// Update time slider and refresh markers
function updateTimeSlider(year) {
    currentYear = parseInt(year);
    document.getElementById('selectedYear').textContent = year === '2024' ? 'Now' : year;

    // Update label highlighting
    document.querySelectorAll('.time-slider-labels span').forEach(label => {
        const labelYear = parseInt(label.dataset.year);
        label.classList.toggle('active', labelYear === currentYear || (currentYear === 2024 && label.dataset.year === '2024'));
    });

    // Update all markers based on the selected year
    updateMarkersForYear(currentYear);
}

// Update markers to show historical stage for the selected year
function updateMarkersForYear(year) {
    allMarkers.forEach(dest => {
        let stageForYear;

        if (year === 2024) {
            stageForYear = dest.phase;
        } else {
            // Get the stage for the selected year
            const columnName = yearToColumn[year];
            stageForYear = dest[columnName];

            // If no historical data, fall back to earliest available or hide
            if (!stageForYear && dest.hasHistoricalData) {
                // Find the closest available year
                const years = [1980, 1990, 2000, 2010, 2020];
                for (let i = years.indexOf(year); i < years.length; i++) {
                    const col = yearToColumn[years[i]];
                    if (dest[col]) {
                        stageForYear = dest[col];
                        break;
                    }
                }
            }

            // If still no stage, use current or mark as not existing
            if (!stageForYear) {
                stageForYear = dest.phase; // Default to current
            }
        }

        // Update marker color based on the stage for this year
        const color = stageColors[stageForYear] || '#95a5a6';
        dest.marker.setStyle({
            fillColor: color
        });

        // Store current displayed stage for filtering
        dest.currentDisplayPhase = stageForYear;
    });

    // Re-apply filters with new stage data
    applyFilters();
}

// ===== WATCH LIST FUNCTIONALITY =====

// Load watch list from localStorage
function loadWatchList() {
    const stored = localStorage.getItem('talcWatchList');
    if (stored) {
        watchList = JSON.parse(stored);
    }
    updateWatchListUI();
}

// Save watch list to localStorage
function saveWatchList() {
    localStorage.setItem('talcWatchList', JSON.stringify(watchList));
    updateWatchListUI();
}

// Toggle watch list panel visibility
function toggleWatchList() {
    const panel = document.getElementById('watchListPanel');
    panel.classList.toggle('hidden');
}

// Add destination to watch list
function addToWatchList(name, country, phase, lat, lng, type) {
    const id = `${name.toLowerCase()}_${type}`;

    // Check if already in watch list
    if (watchList.find(item => item.id === id)) {
        removeFromWatchList(id);
        return;
    }

    watchList.push({
        id: id,
        name: name,
        country: country,
        phase: phase,
        latitude: lat,
        longitude: lng,
        type: type,
        addedAt: new Date().toISOString()
    });

    saveWatchList();
}

// Remove destination from watch list
function removeFromWatchList(id) {
    watchList = watchList.filter(item => item.id !== id);
    saveWatchList();
}

// Clear entire watch list
function clearWatchList() {
    if (confirm('Are you sure you want to clear your entire watch list?')) {
        watchList = [];
        saveWatchList();
    }
}

// Check if destination is in watch list
function isInWatchList(name, type) {
    const id = `${name.toLowerCase()}_${type}`;
    return watchList.find(item => item.id === id);
}

// Update watch list UI
function updateWatchListUI() {
    const countEl = document.getElementById('watchListCount');
    const contentEl = document.getElementById('watchListContent');

    countEl.textContent = watchList.length;

    if (watchList.length === 0) {
        contentEl.innerHTML = '<p class="watch-list-empty">No destinations in your watch list yet. Click the star icon on any destination to add it.</p>';
        return;
    }

    contentEl.innerHTML = watchList.map(item => `
        <div class="watch-list-item">
            <div class="watch-item-info" onclick="zoomToDestination(${item.latitude}, ${item.longitude}, '${item.name.replace(/'/g, "\\'")}')">
                <span class="watch-item-name">${item.name}</span>
                <span class="watch-item-country">${item.country}</span>
                <span class="watch-item-phase ${item.phase.toLowerCase()}">${item.phase}</span>
            </div>
            <button class="watch-item-remove" onclick="removeFromWatchList('${item.id}')" title="Remove from watch list">
                &times;
            </button>
        </div>
    `).join('');
}

// Zoom to destination on map
function zoomToDestination(lat, lng, name) {
    map.setView([lat, lng], 10);

    // Find and open the popup for this destination
    allMarkers.forEach(dest => {
        if (dest.displayName === name) {
            dest.marker.openPopup();
        }
    });

    // Close watch list panel
    document.getElementById('watchListPanel').classList.add('hidden');
}

// ===== EXPLORE SIMILAR FUNCTIONALITY =====

// Find similar destinations based on stage, region, or type
function findSimilarDestinations(name, phase, country, type, limit = 5) {
    const phaseLower = phase.toLowerCase();
    const countryLower = country.toLowerCase();

    // Score destinations by similarity
    const scored = allDestinations
        .filter(d => d.displayName !== name) // Exclude current destination
        .map(d => {
            let score = 0;

            // Same stage = 3 points
            if (d.phase === phaseLower) score += 3;

            // Same country = 2 points
            if (d.country === countryLower) score += 2;

            // Same type = 1 point
            if (d.type === type) score += 1;

            // Adjacent stages get partial credit
            const stageOrder = ['exploration', 'involvement', 'development', 'consolidation', 'stagnation', 'decline', 'rejuvenation'];
            const currentIndex = stageOrder.indexOf(phaseLower);
            const destIndex = stageOrder.indexOf(d.phase);
            if (Math.abs(currentIndex - destIndex) === 1) score += 1;

            return { ...d, similarityScore: score };
        })
        .filter(d => d.similarityScore > 0)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

    return scored;
}

// Generate HTML for similar destinations
function getSimilarDestinationsHTML(name, phase, country, type) {
    const similar = findSimilarDestinations(name, phase, country, type);

    if (similar.length === 0) {
        return '';
    }

    return `
        <div class="modal-similar">
            <h4>Explore Similar Destinations</h4>
            <div class="similar-destinations-list">
                ${similar.map(d => {
                    const escapedJustification = (d.justification || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    return `
                        <div class="similar-item" onclick="showDestinationDetails('${d.displayName.replace(/'/g, "\\'")}', '${d.displayCountry.replace(/'/g, "\\'")}', '${d.displayPhase}', ${d.latitude}, ${d.longitude}, '${d.type}', '${(d.parent || '').replace(/'/g, "\\'")}', '${escapedJustification}')">
                            <span class="similar-name">${d.displayName}</span>
                            <span class="similar-country">${d.displayCountry}</span>
                            <span class="similar-phase ${d.phase}">${d.displayPhase}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ===== CASE STUDIES FUNCTIONALITY =====

const caseStudies = {
    albania: {
        title: "Albania's Tourism Boom",
        subtitle: "From Hidden Gem to Europe's Hottest Destination",
        stage: "Development",
        timeline: [
            { year: "Pre-2000", stage: "Exploration", description: "Post-communist Albania largely closed to tourism. Few adventurous travelers visited." },
            { year: "2000-2010", stage: "Exploration", description: "Gradual opening. Backpackers discover Albanian Riviera. Infrastructure minimal." },
            { year: "2010-2019", stage: "Involvement", description: "Local entrepreneurs build guesthouses. Saranda and Ksamil gain attention. Tourism season emerges." },
            { year: "2019-2024", stage: "Development", description: "Explosive growth. 11.7M visitors in 2024, 80% increase vs 2019. International attention soars." }
        ],
        content: `
            <h3>The Transformation</h3>
            <p>Albania's tourism story is one of Europe's most remarkable recent transformations. Once virtually closed to outside visitors during its communist era, the country has emerged as the continent's fastest-growing destination.</p>

            <h3>Key Development Indicators</h3>
            <ul>
                <li><strong>11.7 million visitors</strong> in 2024 - a number that seems impossible for a country of just 2.8 million people</li>
                <li><strong>€2.3 billion</strong> in tourism revenue</li>
                <li><strong>80% growth</strong> compared to pre-pandemic 2019 levels</li>
                <li>New <strong>Llogara Tunnel</strong> dramatically improved access to the Albanian Riviera</li>
            </ul>

            <h3>TALC Analysis</h3>
            <p>Albania demonstrates classic Development stage characteristics: rapid external investment, infrastructure expansion, and a fundamental shift from local to international tourism. The Albanian Riviera, once known only to a handful of backpackers, now features international hotel brands and direct flights from across Europe.</p>

            <h3>Challenges Ahead</h3>
            <p>Albania's rapid growth brings risks. Saranda already shows signs of overdevelopment, while pristine areas like Theth face pressure to develop. The country stands at a crossroads: will it follow the path of Croatia (successful but expensive) or risk the overtourism of Venice?</p>

            <h3>Lessons for TALC Theory</h3>
            <p>Albania shows how social media and low-cost carriers can accelerate the TALC progression dramatically. What took decades in traditional destinations is happening in years.</p>
        `,
        mapCoords: [41.1533, 20.1683]
    },
    venice: {
        title: "Venice's Overtourism Crisis",
        subtitle: "When Tourism Destroys What It Loves",
        stage: "Decline",
        timeline: [
            { year: "1950s-1970s", stage: "Consolidation", description: "Venice established as premier cultural destination. Mass tourism begins." },
            { year: "1980s-2000s", stage: "Stagnation", description: "Tourism dominates economy. Local population begins decline. Day-trippers increase." },
            { year: "2000s-2020", stage: "Decline", description: "Population drops below 55,000. Cruise ships bring 30,000 daily visitors. UNESCO threatens delisting." },
            { year: "2020-Present", stage: "Attempted Rejuvenation", description: "Entry fees introduced. Cruise ships partially banned. Population continues falling." }
        ],
        content: `
            <h3>A City Transformed</h3>
            <p>Venice represents perhaps the most dramatic cautionary tale in tourism development. A city that inspired generations of artists and travelers has been fundamentally altered by the industry it helped create.</p>

            <h3>The Numbers Tell the Story</h3>
            <ul>
                <li><strong>Population collapse:</strong> From 175,000 in 1951 to under 50,000 today</li>
                <li><strong>30+ million annual visitors</strong> in a city built for a fraction of that</li>
                <li><strong>70% of housing</strong> converted to tourist accommodation</li>
                <li>Local shops replaced by <strong>souvenir stores and fast food</strong></li>
            </ul>

            <h3>TALC Analysis</h3>
            <p>Venice exemplifies the Decline stage where tourism has fundamentally degraded the destination's appeal and livability. The authentic Venetian experience that attracted visitors no longer exists - the city has become a stage set populated primarily by tourists.</p>

            <h3>Attempted Interventions</h3>
            <p>Venice has tried various measures: entry fees for day-trippers (€5), cruise ship restrictions, and penalties for anti-social behavior. But these address symptoms, not causes. The economic incentives still favor tourism over residents.</p>

            <h3>Lessons for TALC Theory</h3>
            <p>Venice shows that Decline doesn't mean fewer tourists - it means the death of what made the destination special. Butler's original theory focused on visitor numbers, but Venice proves that qualitative decline can occur even with high visitation.</p>
        `,
        mapCoords: [45.4408, 12.3155]
    },
    iceland: {
        title: "Iceland's Sustainable Approach",
        subtitle: "Managing Growth Before It's Too Late",
        stage: "Development",
        timeline: [
            { year: "1990s", stage: "Exploration", description: "Iceland known mainly to nature enthusiasts and adventure travelers." },
            { year: "2000-2010", stage: "Involvement", description: "Icelandair's stopover program introduces casual travelers. Infrastructure develops." },
            { year: "2010-2016", stage: "Development", description: "Post-financial crisis push into tourism. Visitor numbers explode from 500K to 1.8M." },
            { year: "2016-Present", stage: "Development with Pressures", description: "2.3M visitors annually. Government implements management measures." }
        ],
        content: `
            <h3>Managing Success</h3>
            <p>Iceland's tourism story is unique: a country that recognized the risks of rapid development and acted before reaching Consolidation's problems. With 2.3 million annual visitors for a population of 375,000, Iceland has perhaps the highest tourist-to-resident ratio of any country.</p>

            <h3>Proactive Management</h3>
            <ul>
                <li><strong>Surge pricing</strong> at popular attractions during peak times</li>
                <li><strong>Conservation fees</strong> to fund environmental protection</li>
                <li><strong>Visitor caps</strong> at fragile natural sites</li>
                <li><strong>Infrastructure investment</strong> in dispersed attractions</li>
            </ul>

            <h3>TALC Analysis</h3>
            <p>Iceland sits firmly in Development but shows awareness of Consolidation risks. The government's explicit goal is sustainable tourism, not maximum tourism. This represents a deliberate choice to manage TALC progression rather than let market forces dictate outcomes.</p>

            <h3>Regional Variation</h3>
            <p>Within Iceland, different regions show different stages: Reykjavik approaches Consolidation with overtourism pressures, while the Westfjords remain in Exploration with minimal infrastructure.</p>

            <h3>Lessons for TALC Theory</h3>
            <p>Iceland demonstrates that TALC progression isn't inevitable - policy choices matter. However, it also shows the difficulty of balancing economic benefits with preservation, especially for a small economy dependent on tourism revenue.</p>
        `,
        mapCoords: [64.9631, -19.0208]
    },
    maldives: {
        title: "Maldives: Luxury at Scale",
        subtitle: "High-Value Tourism Meets Environmental Limits",
        stage: "Consolidation",
        timeline: [
            { year: "1970s-1980s", stage: "Exploration", description: "First resorts open. Exclusive, expensive destination for wealthy travelers." },
            { year: "1990s", stage: "Involvement", description: "More resorts developed. 'One island, one resort' model established." },
            { year: "2000-2009", stage: "Development", description: "International chains enter. Tourism infrastructure expands." },
            { year: "2009-Present", stage: "Consolidation", description: "Guesthouse tourism liberalized. 2.25M visitors annually across 183 resorts." }
        ],
        content: `
            <h3>Paradise Scaled</h3>
            <p>The Maldives presents a fascinating TALC case: a destination that reached Consolidation while maintaining its luxury positioning. With 2.25 million tourists in 2025 and 183 resorts offering 45,289 beds, the Maldives has achieved scale while preserving its premium brand.</p>

            <h3>The Model</h3>
            <ul>
                <li><strong>"One island, one resort"</strong> model maintains exclusivity</li>
                <li><strong>Guesthouse liberalization (2009)</strong> opened local islands to budget travelers</li>
                <li>Tourism contributes <strong>~30% of GDP</strong></li>
                <li>Environmental carrying capacity increasingly stressed</li>
            </ul>

            <h3>TALC Analysis</h3>
            <p>The Maldives shows Consolidation characteristics: major chains dominate, growth rates have slowed, and environmental limits are evident. Yet unlike many Consolidation destinations, it hasn't experienced quality decline - the "one island, one resort" model prevents the kind of overdevelopment seen in beach destinations elsewhere.</p>

            <h3>Climate Threat</h3>
            <p>The elephant in the room: the Maldives averages just 1.5 meters above sea level. Climate change poses an existential threat that no amount of tourism management can address. This adds urgency to maximizing tourism benefits while the destination still exists.</p>

            <h3>Lessons for TALC Theory</h3>
            <p>The Maldives demonstrates that Consolidation doesn't necessarily mean decline in quality - it depends on the development model. The challenge is maintaining high-value tourism while expanding access.</p>
        `,
        mapCoords: [3.2028, 73.2207]
    },
    belize: {
        title: "Belize's Diverse Journey",
        subtitle: "One Country, Multiple TALC Stages",
        stage: "Development",
        timeline: [
            { year: "1970s-1990s", stage: "Exploration", description: "Early ecotourism pioneers discover Belize. Diving and Mayan ruins attract adventurers." },
            { year: "1990s-2010", stage: "Involvement", description: "Ambergris Caye develops. Local operators establish tour businesses." },
            { year: "2010-2020", stage: "Development", description: "International investment accelerates. Cruise tourism grows." },
            { year: "2020-Present", stage: "Mixed Stages", description: "Ambergris approaches Consolidation while Toledo remains Exploration." }
        ],
        content: `
            <h3>A Country of Contrasts</h3>
            <p>Belize offers a unique perspective on TALC theory: a single small country where different regions exist at dramatically different stages of the tourism lifecycle. This makes it an invaluable case study for understanding how development spreads and varies.</p>

            <h3>Regional Stages</h3>
            <ul>
                <li><strong>Ambergris Caye:</strong> Consolidation - 70+ hotels, mostly foreign-owned, infrastructure strain</li>
                <li><strong>Caye Caulker:</strong> Development - rapid growth while maintaining character</li>
                <li><strong>Placencia:</strong> Development - major resort investment zone</li>
                <li><strong>Hopkins:</strong> Involvement - community-based Garifuna tourism</li>
                <li><strong>Toledo District:</strong> Exploration - pristine, minimal infrastructure</li>
            </ul>

            <h3>TALC Analysis</h3>
            <p>Belize demonstrates that TALC stages can coexist within short distances. The $250M airport expansion and 46% GDP contribution from tourism indicate national-level Development, but the country contains the full spectrum from Exploration to approaching Consolidation.</p>

            <h3>Challenges</h3>
            <p>The contrast creates challenges: successful areas like Ambergris Caye face water and sanitation problems affecting the reef, while remote areas lack basic tourism infrastructure. Managing this uneven development is Belize's central tourism challenge.</p>

            <h3>Lessons for TALC Theory</h3>
            <p>Belize shows that TALC analysis must consider sub-national variations. Country-level assessments can mask important regional differences that affect both policy and investment decisions.</p>
        `,
        mapCoords: [17.1899, -88.4976]
    },
    rwanda: {
        title: "Rwanda's High-Value Model",
        subtitle: "$1,500 Gorilla Permits and Conservation Success",
        stage: "Development",
        timeline: [
            { year: "Pre-1994", stage: "Exploration", description: "Early gorilla tourism established by Dian Fossey's work." },
            { year: "1994-2000", stage: "Collapse", description: "Genocide devastates country and tourism industry." },
            { year: "2000-2010", stage: "Rebuilding", description: "Deliberate high-value tourism strategy developed." },
            { year: "2010-Present", stage: "Development", description: "Tourism becomes 2nd largest forex earner. Conservation success story." }
        ],
        content: `
            <h3>A Different Model</h3>
            <p>Rwanda represents a deliberate choice to pursue "high value, low volume" tourism from the start. Rather than maximizing visitor numbers, Rwanda has focused on maximizing revenue per visitor while minimizing environmental and social impact.</p>

            <h3>The Strategy</h3>
            <ul>
                <li><strong>$1,500 gorilla trekking permits</strong> - among world's highest wildlife fees</li>
                <li><strong>Limited daily permits</strong> - only 96 people can visit gorillas per day</li>
                <li><strong>Revenue sharing</strong> - 10% of park fees go directly to local communities</li>
                <li><strong>Conservation success</strong> - mountain gorilla population has grown from 620 to over 1,000</li>
            </ul>

            <h3>TALC Analysis</h3>
            <p>Rwanda challenges traditional TALC thinking by showing that Development doesn't require mass tourism. The country has deliberately constrained supply to maintain premium positioning and environmental integrity.</p>

            <h3>Beyond Gorillas</h3>
            <p>Rwanda is diversifying: conference tourism in Kigali, chimp trekking in Nyungwe, and even positioning as a luxury African destination. Each segment follows the same high-value philosophy.</p>

            <h3>Lessons for TALC Theory</h3>
            <p>Rwanda demonstrates that Development stage can be managed to prevent progression toward Consolidation's problems. By controlling supply and maintaining high prices, Rwanda has created sustainable Development that could theoretically continue indefinitely.</p>
        `,
        mapCoords: [1.9403, 29.8739]
    }
};

// Open case study modal
function openCaseStudy(studyId) {
    const study = caseStudies[studyId];
    if (!study) return;

    const modal = document.getElementById('caseStudyModal');
    const body = document.getElementById('caseStudyBody');

    const timelineHTML = study.timeline.map(t => `
        <div class="timeline-item">
            <div class="timeline-marker ${t.stage.toLowerCase()}"></div>
            <div class="timeline-content">
                <span class="timeline-year">${t.year}</span>
                <span class="timeline-stage ${t.stage.toLowerCase()}">${t.stage}</span>
                <p>${t.description}</p>
            </div>
        </div>
    `).join('');

    body.innerHTML = `
        <div class="case-study-header">
            <h2>${study.title}</h2>
            <p class="case-study-subtitle">${study.subtitle}</p>
            <span class="case-study-stage-badge ${study.stage.toLowerCase()}">${study.stage} Stage</span>
        </div>

        <div class="case-study-timeline">
            <h3>TALC Timeline</h3>
            <div class="timeline">
                ${timelineHTML}
            </div>
        </div>

        <div class="case-study-body">
            ${study.content}
        </div>

        <div class="case-study-actions">
            <button class="btn-view-map" onclick="viewOnMap(${study.mapCoords[0]}, ${study.mapCoords[1]}, '${studyId}')">
                View on Map
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// Close case study modal
function closeCaseStudyModal() {
    document.getElementById('caseStudyModal').classList.remove('active');
}

// View destination on map from case study
function viewOnMap(lat, lng, studyId) {
    closeCaseStudyModal();

    // Scroll to map
    document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });

    // After scroll, zoom to location
    setTimeout(() => {
        map.setView([lat, lng], 6);
    }, 500);
}

// Close case study modal on outside click
document.addEventListener('click', function(e) {
    const caseModal = document.getElementById('caseStudyModal');
    if (e.target === caseModal) {
        closeCaseStudyModal();
    }
});

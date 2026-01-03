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

// Global variables
let map;
let allMarkers = [];
let allDestinations = [];
let addedDestinations = new Set();
let stageDistributionChart = null;
let regionalDistributionChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadDestinations();
    initHeroChart();
    initTALCCurve();
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
function createMarker(lat, lng, phase) {
    const color = stageColors[phase.toLowerCase()] || '#95a5a6';

    return L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    });
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
    data.forEach(dest => {
        if (!dest.name || !dest.latitude || !dest.longitude || !dest.phase) return;

        const uniqueKey = dest.name.toLowerCase().trim();

        if (addedDestinations.has(uniqueKey)) return;
        addedDestinations.add(uniqueKey);

        const lat = parseFloat(dest.latitude);
        const lng = parseFloat(dest.longitude);
        const phase = dest.phase.trim();
        const country = dest.country || 'Unknown';

        if (isNaN(lat) || isNaN(lng)) return;

        const marker = createMarker(lat, lng, phase);

        const popupContent = `
            <div class="popup-content">
                <h3>${dest.name}</h3>
                <p class="popup-country">${country}</p>
                <span class="popup-phase ${phase.toLowerCase()}">${phase} Stage</span>
                <p class="popup-details" onclick="showDestinationDetails('${dest.name.replace(/'/g, "\\'")}', '${country.replace(/'/g, "\\'")}', '${phase}', ${lat}, ${lng})">View Details</p>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);

        const destData = {
            marker: marker,
            name: dest.name.toLowerCase(),
            displayName: dest.name,
            phase: phase.toLowerCase(),
            displayPhase: phase,
            country: country.toLowerCase(),
            displayCountry: country,
            latitude: lat,
            longitude: lng
        };

        allMarkers.push(destData);
        allDestinations.push(destData);
    });

    updateStats();
    initCharts();
    generateInsights();
}

// Search destinations
function searchDestinations() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const selectedPhase = document.getElementById('phaseFilter').value.toLowerCase();
    let visibleCount = 0;

    allMarkers.forEach(dest => {
        const matchesSearch = dest.name.includes(input) || dest.country.includes(input);
        const matchesPhase = selectedPhase === 'all' || dest.phase === selectedPhase;

        if (matchesSearch && matchesPhase) {
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

// Filter by phase
function filterByPhase() {
    searchDestinations();
}

// Quick filter from legend click
function quickFilter(phase) {
    document.getElementById('phaseFilter').value = phase;
    document.getElementById('searchInput').value = '';
    filterByPhase();
}

// Reset all filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('phaseFilter').value = 'all';

    allMarkers.forEach(dest => {
        if (!map.hasLayer(dest.marker)) {
            dest.marker.addTo(map);
        }
    });

    document.getElementById('visibleDestinations').textContent = allMarkers.length;
}

// Update statistics
function updateStats() {
    const totalDestinations = allMarkers.length;
    const countries = new Set(allMarkers.map(d => d.country));

    document.getElementById('totalDestinations').textContent = totalDestinations;
    document.getElementById('visibleDestinations').textContent = totalDestinations;
    document.getElementById('countriesCount').textContent = countries.size;
}

// Show destination details in modal
function showDestinationDetails(name, country, phase, lat, lng) {
    const modal = document.getElementById('destinationModal');
    const modalBody = document.getElementById('modalBody');
    const phaseLower = phase.toLowerCase();
    const description = stageDescriptions[phaseLower] || 'Information not available for this stage.';

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2>${name}</h2>
            <p class="country">${country}</p>
        </div>
        <div class="modal-stage">
            <span class="stage-badge ${phaseLower}">${phase} Stage</span>
            <p>${description}</p>
        </div>
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
        'europe': ['france', 'germany', 'italy', 'spain', 'portugal', 'uk', 'united kingdom', 'netherlands', 'belgium', 'austria', 'switzerland', 'greece', 'czech republic', 'poland', 'hungary', 'croatia', 'ireland', 'denmark', 'sweden', 'norway', 'finland', 'russia', 'ukraine', 'romania', 'bulgaria', 'serbia', 'montenegro', 'albania', 'north macedonia', 'bosnia and herzegovina', 'slovenia', 'slovakia', 'latvia', 'lithuania', 'estonia', 'malta', 'cyprus', 'iceland', 'monaco', 'luxembourg', 'liechtenstein', 'andorra', 'san marino', 'vatican city', 'moldova', 'belarus', 'kosovo'],
        'asia': ['china', 'japan', 'south korea', 'india', 'thailand', 'vietnam', 'indonesia', 'malaysia', 'philippines', 'singapore', 'hong kong', 'taiwan', 'myanmar', 'cambodia', 'laos', 'nepal', 'sri lanka', 'bangladesh', 'pakistan', 'mongolia', 'bhutan', 'maldives', 'brunei', 'timor-leste', 'macau'],
        'middle east': ['uae', 'united arab emirates', 'qatar', 'saudi arabia', 'oman', 'bahrain', 'kuwait', 'israel', 'jordan', 'lebanon', 'turkey', 'iran', 'iraq', 'syria', 'yemen', 'palestine'],
        'africa': ['south africa', 'egypt', 'morocco', 'kenya', 'tanzania', 'ethiopia', 'nigeria', 'ghana', 'senegal', 'tunisia', 'madagascar', 'namibia', 'botswana', 'zimbabwe', 'zambia', 'mozambique', 'rwanda', 'uganda', 'mauritius', 'seychelles'],
        'north america': ['usa', 'united states', 'canada', 'mexico', 'puerto rico'],
        'south america': ['brazil', 'argentina', 'chile', 'peru', 'colombia', 'ecuador', 'bolivia', 'uruguay', 'paraguay', 'venezuela', 'guyana', 'suriname'],
        'oceania': ['australia', 'new zealand', 'fiji', 'papua new guinea', 'samoa', 'tonga', 'vanuatu', 'solomon islands', 'palau', 'micronesia'],
        'caribbean': ['jamaica', 'cuba', 'dominican republic', 'bahamas', 'barbados', 'trinidad and tobago', 'haiti', 'aruba', 'cayman islands', 'bermuda', 'antigua', 'st. lucia', 'grenada', 'belize', 'panama', 'costa rica', 'nicaragua', 'honduras', 'guatemala', 'el salvador']
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
        '#9b59b6', '#e67e22', '#1abc9c', '#34495e', '#95a5a6'
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

    // Rejuvenation rate
    const rejuvenationPercent = ((stageCounts.rejuvenation / allDestinations.length) * 100).toFixed(1);

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
            title: 'Rejuvenation Rate',
            value: `${rejuvenationPercent}%`,
            description: 'Destinations successfully reinventing'
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

// -------------------------------------------------------------
// Campus Life Gallery Data & Logic
// -------------------------------------------------------------

const GALLERY_PHOTOS = [
  // Academics (8 photos)
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    title: "Collaborative Study Group",
    category: "Academics",
    description: "Students working together in the modern learning commons."
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&auto=format&fit=crop&q=80",
    title: "Main Campus Library",
    category: "Academics",
    description: "Quiet study zones surrounded by towering bookshelves."
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
    title: "Advanced Chemistry Lab",
    category: "Academics",
    description: "Hands-on research and experimentation in science modules."
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    title: "Software Engineering Lab",
    category: "Academics",
    description: "Students coding algorithms in the cybersecurity studio."
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80",
    title: "Interactive Lecture Hall",
    category: "Academics",
    description: "Engaging classroom environments with digital smartboards."
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80",
    title: "Personal Mentoring Session",
    category: "Academics",
    description: "One-on-one guidance sessions with academic mentors."
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    title: "Final Exam Preparation",
    category: "Academics",
    description: "Focused revision sessions in the academic lounge."
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    title: "Academic Reference Desk",
    category: "Academics",
    description: "Expert research support and archives assistance."
  },

  // Campus (7 photos)
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
    title: "Historic Quadrangle",
    category: "Campus",
    description: "The traditional brick halls overlooking the central quad."
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    title: "Graduation Hall Corridor",
    category: "Campus",
    description: "Elegant modern architectural columns in the central pavilion."
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1492538368577-8b5fd600d771?w=800&auto=format&fit=crop&q=80",
    title: "Lush Green Lawns",
    category: "Campus",
    description: "Relaxing outdoor spaces for students to connect between classes."
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=800&auto=format&fit=crop&q=80",
    title: "Modern Student Center",
    category: "Campus",
    description: "The architectural hub containing student lounges and dining."
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    title: "Central Walkway",
    category: "Campus",
    description: "Bustling campus paths during midday class changeover."
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    title: "Sunset Over Main Gate",
    category: "Campus",
    description: "Stunning dusk lighting reflecting off the glass library facade."
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&auto=format&fit=crop&q=80",
    title: "Courtyard Amphitheater",
    category: "Campus",
    description: "Open-air steps used for campus assemblies and events."
  },

  // Activities (8 photos)
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
    title: "Fine Art Studio",
    category: "Activities",
    description: "Students painting canvases in the bright visual arts studio."
  },
  {
    id: 17,
    src: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop&q=80",
    title: "Student Music Band",
    category: "Activities",
    description: "Band members rehearsing for the upcoming spring concert."
  },
  {
    id: 18,
    src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80",
    title: "Makerspace Engineering Workshop",
    category: "Activities",
    description: "Designing robotics and 3D printing components."
  },
  {
    id: 19,
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    title: "Coding Club Hackathon",
    category: "Activities",
    description: "Late-night hackathon brainstorming and coding session."
  },
  {
    id: 20,
    src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80",
    title: "Student Council Panel",
    category: "Activities",
    description: "Debating upcoming initiatives and student representation."
  },
  {
    id: 21,
    src: "https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=800&auto=format&fit=crop&q=80",
    title: "Photography Workshop",
    category: "Activities",
    description: "Students checking camera settings in photojournalism club."
  },
  {
    id: 22,
    src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80",
    title: "Annual Cultural Fest",
    category: "Activities",
    description: "Vibrant performances celebrating diversity on campus."
  },
  {
    id: 23,
    src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80",
    title: "Volunteering Outreach Program",
    category: "Activities",
    description: "Students collaborating on a community tree plantation drive."
  },

  // Sports (7 photos)
  {
    id: 24,
    src: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    title: "Soccer Team Championship",
    category: "Sports",
    description: "Intense football action on the main campus stadium."
  },
  {
    id: 25,
    src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
    title: "Basketball Varsity Court",
    category: "Sports",
    description: "Practice sessions at the newly renovated campus gymnasium."
  },
  {
    id: 26,
    src: "https://images.unsplash.com/photo-1476525223214-c31ff1cfd66a?w=800&auto=format&fit=crop&q=80",
    title: "Track and Field Relay",
    category: "Sports",
    description: "Athletes practicing sprint handovers on the athletic track."
  },
  {
    id: 27,
    src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80",
    title: "Campus Running Club",
    category: "Sports",
    description: "Early morning cross-country run through campus woodlands."
  },
  {
    id: 28,
    src: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=800&auto=format&fit=crop&q=80",
    title: "Tennis Tournament Singles",
    category: "Sports",
    description: "Competitive match during the Inter-school Tennis Open."
  },
  {
    id: 29,
    src: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=800&auto=format&fit=crop&q=80",
    title: "Swimming Championship Pools",
    category: "Sports",
    description: "Swimmers diving off the block in the Olympic-size aquatics center."
  },
  {
    id: 30,
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    title: "Badminton Open Doubles",
    category: "Sports",
    description: "Speedy doubles match in the indoor athletics complex."
  }
];

const CATEGORIES = ['All', 'Campus', 'Academics', 'Activities', 'Sports'];

// State
let activeFilter = 'All';
let selectedPhotoIndex = null;
let filteredPhotos = [...GALLERY_PHOTOS];

// DOM Selectors
const filterTabsContainer = document.getElementById('filter-tabs');
const photosGrid = document.getElementById('photos-grid');
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCategory = document.getElementById('lightbox-category');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxCounter = document.getElementById('lightbox-counter');

const btnClose = document.getElementById('lightbox-close');
const btnPrev = document.getElementById('lightbox-prev');
const btnNext = document.getElementById('lightbox-next');

// Render filter buttons
function renderFilterTabs() {
  filterTabsContainer.innerHTML = '';
  CATEGORIES.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category;
    
    // Class definitions depending on active state
    if (activeFilter === category) {
      btn.className = 'px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 border bg-neutral-100 text-neutral-950 border-neutral-100 shadow-lg shadow-neutral-100/10 scale-105';
    } else {
      btn.className = 'px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 border bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200';
    }

    btn.addEventListener('click', () => {
      activeFilter = category;
      filteredPhotos = activeFilter === 'All' 
        ? GALLERY_PHOTOS 
        : GALLERY_PHOTOS.filter(photo => photo.category === activeFilter);
      
      renderFilterTabs();
      renderPhotosGrid();
    });

    filterTabsContainer.appendChild(btn);
  });
}

// Render photos grid
function renderPhotosGrid() {
  photosGrid.innerHTML = '';
  
  filteredPhotos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'group relative h-64 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer shadow-md hover:shadow-xl hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1';
    
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-110">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      <div class="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-neutral-800/90 text-neutral-300 border border-neutral-700 mb-2.5">
          ${photo.category}
        </span>
        <h3 class="text-base font-bold text-neutral-100 group-hover:text-white line-clamp-1 transition-colors duration-300">
          ${photo.title}
        </h3>
        <p class="text-neutral-400 text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
          ${photo.description}
        </p>
      </div>
    `;

    card.addEventListener('click', () => {
      openLightbox(index);
    });

    photosGrid.appendChild(card);
  });
}

// Lightbox modal logic
function openLightbox(index) {
  selectedPhotoIndex = index;
  updateLightboxContent();
  lightboxModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden'); // stop page scrolling in background
}

function closeLightbox() {
  selectedPhotoIndex = null;
  lightboxModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function updateLightboxContent() {
  if (selectedPhotoIndex === null) return;
  const photo = filteredPhotos[selectedPhotoIndex];
  
  // Set content
  lightboxImg.src = photo.src;
  lightboxImg.alt = photo.title;
  lightboxCategory.textContent = photo.category;
  lightboxTitle.textContent = photo.title;
  lightboxDesc.textContent = photo.description;
  lightboxCounter.textContent = `${selectedPhotoIndex + 1} of ${filteredPhotos.length}`;

  // Restart fade scale animation
  lightboxImg.classList.remove('animate-fade-in');
  void lightboxImg.offsetWidth; // trigger reflow
  lightboxImg.classList.add('animate-fade-in');
}

function showPrevPhoto() {
  if (selectedPhotoIndex === null) return;
  selectedPhotoIndex = selectedPhotoIndex === 0 
    ? filteredPhotos.length - 1 
    : selectedPhotoIndex - 1;
  updateLightboxContent();
}

function showNextPhoto() {
  if (selectedPhotoIndex === null) return;
  selectedPhotoIndex = selectedPhotoIndex === filteredPhotos.length - 1 
    ? 0 
    : selectedPhotoIndex + 1;
  updateLightboxContent();
}

// Event Listeners for Lightbox Controls
btnClose.addEventListener('click', closeLightbox);
btnPrev.addEventListener('click', showPrevPhoto);
btnNext.addEventListener('click', showNextPhoto);

// Close lightbox on clicking outside the image container
lightboxModal.addEventListener('click', (e) => {
  if (e.target === lightboxModal) {
    closeLightbox();
  }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
  if (selectedPhotoIndex === null) return;
  
  if (e.key === 'ArrowLeft') {
    showPrevPhoto();
  } else if (e.key === 'ArrowRight') {
    showNextPhoto();
  } else if (e.key === 'Escape') {
    closeLightbox();
  }
});

// Initialization
function init() {
  renderFilterTabs();
  renderPhotosGrid();
}

init();

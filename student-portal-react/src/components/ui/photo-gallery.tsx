'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Photo {
  id: number;
  src: string;
  title: string;
  category: string;
  description: string;
}

const GALLERY_PHOTOS: Photo[] = [
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

export function PhotoGallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const filteredPhotos = activeFilter === 'All'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter(photo => photo.category === activeFilter);

  const handlePrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    const prevIndex = selectedPhotoIndex === 0 ? filteredPhotos.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(prevIndex);
  }, [selectedPhotoIndex, filteredPhotos]);

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    const nextIndex = selectedPhotoIndex === filteredPhotos.length - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(nextIndex);
  }, [selectedPhotoIndex, filteredPhotos]);

  const handleClose = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handlePrev, handleNext, handleClose]);

  return (
    <div className="w-full mt-16 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-800 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Campus Life Gallery
          </h2>
          <p className="text-neutral-400 mt-2 text-sm max-w-md">
            Explore 30 snapshots capturing the academic excellence, student initiatives, vibrant events, and athletics on campus.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                setActiveFilter(category);
                setSelectedPhotoIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 border ${
                activeFilter === category
                  ? 'bg-neutral-100 text-neutral-950 border-neutral-100 shadow-lg shadow-neutral-100/10 scale-105'
                  : 'bg-transparent text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhotoIndex(index)}
            className="group relative h-64 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer shadow-md hover:shadow-xl hover:shadow-black/50 transition-all duration-500 hover:-translate-y-1"
          >
            {/* Image tag */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-110"
            />
            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Hover details */}
            <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-neutral-800/90 text-neutral-300 border border-neutral-700 mb-2.5">
                {photo.category}
              </span>
              <h3 className="text-base font-bold text-neutral-100 group-hover:text-white line-clamp-1 transition-colors duration-300">
                {photo.title}
              </h3>
              <p className="text-neutral-400 text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                {photo.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 select-none">
          {/* Close button (top right) */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all duration-300"
            aria-label="Close Lightbox"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 z-40 p-3 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all duration-300"
            aria-label="Previous Photo"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Center Image and Description container */}
          <div className="flex flex-col max-w-4xl w-full h-full max-h-[85vh] justify-center items-center gap-4">
            <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filteredPhotos[selectedPhotoIndex].src}
                alt={filteredPhotos[selectedPhotoIndex].title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-fade-in duration-300"
              />
            </div>

            {/* Lightbox Meta details */}
            <div className="text-center max-w-2xl px-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-neutral-900 border border-neutral-800 text-neutral-400 mb-2">
                {filteredPhotos[selectedPhotoIndex].category}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-neutral-50">
                {filteredPhotos[selectedPhotoIndex].title}
              </h3>
              <p className="text-neutral-400 text-xs md:text-sm mt-1.5 leading-relaxed">
                {filteredPhotos[selectedPhotoIndex].description}
              </p>
              <div className="text-neutral-500 text-xs mt-3">
                {selectedPhotoIndex + 1} of {filteredPhotos.length}
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 z-40 p-3 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all duration-300"
            aria-label="Next Photo"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

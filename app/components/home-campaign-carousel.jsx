"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: "doctor-guidance",
    title: "What’s Your Ayurvedic Body Type?",
    subtitle: "Take the free assessment and get tailored health tips.",
    cta: "Start Assessment",
    href: "/contact",
    photo: "/rudraksha-logo-v2.png",
    imagePosition: "right center",
  },
  {
    id: "rx-support",
    title: "Need Fast Prescription Fulfillment?",
    subtitle: "Upload your prescription and get trusted guidance from our team.",
    cta: "Upload Prescription",
    href: "/products",
    photo: "/products/default-medicine.svg",
    imagePosition: "center center",
  },
];

export function HomeCampaignCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  const goToPrevious = () => {
    setActiveIndex((previous) => (previous - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((previous) => (previous + 1) % slides.length);
  };

  return (
    <section className="section container home-campaign-section" aria-label="Health campaign">
      <div className="home-campaign-shell">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`home-campaign-slide ${index === activeIndex ? "is-active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            <div className="home-campaign-copy">
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              <Link href={slide.href} className="home-campaign-cta-icon" aria-label={slide.cta}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
                </svg>
              </Link>
            </div>
            <div className="home-campaign-image-wrap">
              <Image
                src={slide.photo}
                alt={slide.title}
                width={680}
                height={360}
                className="home-campaign-image"
                style={{ objectPosition: slide.imagePosition }}
                priority={index === 0}
              />
            </div>
          </article>
        ))}

        <div className="home-campaign-controls">
          <button type="button" className="home-campaign-nav" onClick={goToPrevious} aria-label="Previous slide">
            &#8249;
          </button>
          <div className="home-campaign-dots" role="tablist" aria-label="Campaign slides">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={`home-campaign-dot ${index === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
          <button type="button" className="home-campaign-nav" onClick={goToNext} aria-label="Next slide">
            &#8250;
          </button>
          <button
            type="button"
            className="home-campaign-pause"
            onClick={() => setIsPaused((previous) => !previous)}
            aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="home-campaign-control-icon">
                <path d="M8 6.5v11l9-5.5-9-5.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="home-campaign-control-icon">
                <rect x="7" y="6.5" width="3.5" height="11" rx="1" />
                <rect x="13.5" y="6.5" width="3.5" height="11" rx="1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

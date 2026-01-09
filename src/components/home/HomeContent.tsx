"use client";

import { useState, useEffect } from "react";
import WelcomeModal from "@/components/WelcomeModal";
import HeroSection from "@/components/HeroSection";
import MostSoldProducts from "@/components/MostSoldProducts";
import BestOffers from "@/components/BestOffers";
import TopCategories from "@/components/TopCategories";
import BestSellers from "@/components/BestSellers";
import WhyChooseSCB from "@/components/WhyChooseSCB";
import BlogInsights from "@/components/BlogInsights";
import YouTubeReviews from "@/components/YouTubeReviews";
import ReviewsMarquee from "@/components/ReviewsMarquee";

// 1 hour in milliseconds
const SESSION_DURATION = 60 * 60 * 1000;

export default function HomeContent() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Check if modal was shown within the last 1 hour
    const lastSeenTimestamp = localStorage.getItem("scb_welcome_modal_timestamp");

    if (lastSeenTimestamp) {
      const timePassed = Date.now() - parseInt(lastSeenTimestamp, 10);
      // If more than 1 hour has passed, show the modal again
      if (timePassed >= SESSION_DURATION) {
        setShowWelcomeModal(true);
      }
    } else {
      // First time visitor - show modal
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    // Store current timestamp
    localStorage.setItem("scb_welcome_modal_timestamp", Date.now().toString());
  };

  return (
    <>
      <WelcomeModal open={showWelcomeModal} onClose={handleCloseModal} />

      <HeroSection />

      <MostSoldProducts />
      <BestOffers />
      <TopCategories />
      <BestSellers />
      <WhyChooseSCB />
      <ReviewsMarquee />
      <BlogInsights />
      <YouTubeReviews />
    </>
  );
}

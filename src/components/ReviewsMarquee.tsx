import { Star } from "lucide-react";

const ReviewsMarquee = () => {
  const reviews = [
    {
      name: "Harsh Kumar",
      location: "Mumbai",
      rating: 5,
      text: "Amazing support staff. Got my RTX 5090 build delivered on time. Highly recommended!"
    },
    {
      name: "Priya Singh",
      location: "Delhi",
      rating: 5,
      text: "Best prices I found for Ryzen processors. Fast shipping and genuine products."
    },
    {
      name: "Rohan Desai",
      location: "Bangalore",
      rating: 5,
      text: "SCB helped me build my dream gaming PC. Expert guidance throughout."
    },
    {
      name: "Sneha Patel",
      location: "Pune",
      rating: 5,
      text: "Excellent customer service. My liquid cooling system was installed perfectly."
    },
    {
      name: "Arjun Mehta",
      location: "Ahmedabad",
      rating: 5,
      text: "Genuine products at competitive prices. Will definitely buy again!"
    },
    {
      name: "Kavya Reddy",
      location: "Hyderabad",
      rating: 5,
      text: "Great experience! Got my gaming laptop with amazing discount during festive sale."
    }
  ];

  const ReviewCard = ({ name, location, rating, text }: typeof reviews[0]) => (
    <div className="glass-panel rounded-xl p-4 sm:p-6 min-w-[260px] sm:min-w-[320px] md:min-w-[350px] mx-2 sm:mx-3 hover:scale-105 transition-transform">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg sm:text-xl font-bold">
          {name[0]}
        </div>
        <div>
          <h4 className="font-semibold text-sm sm:text-base">{name}</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">{location}</p>
        </div>
      </div>

      <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-accent text-accent" />
        ))}
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground italic line-clamp-3">"{text}"</p>
    </div>
  );

  return (
    <section className="py-8 sm:py-12 md:py-16 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2">What People Are Saying About SCB</h2>
        <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full glow-teal" />
      </div>

      {/* Top Row - Moving Left */}
      <div className="mb-4 relative">
        <div className="flex animate-marquee-left">
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`top-${index}`} {...review} />
          ))}
        </div>
      </div>

      {/* Bottom Row - Moving Right */}
      <div className="relative">
        <div className="flex animate-marquee-right">
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`bottom-${index}`} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsMarquee;

import { Shield, Truck, Headphones, Award, CreditCard, MessageCircle } from "lucide-react";

const WhyChooseSCB = () => {
  const features = [
    {
      icon: Shield,
      title: "Genuine Components",
      description: "100% authentic products with manufacturer warranty"
    },
    {
      icon: Truck,
      title: "Fast Delivery Across India",
      description: "Express shipping to all major cities within 24-48 hours"
    },
    {
      icon: Headphones,
      title: "Expert Build Support",
      description: "Free consultation from our PC building experts"
    },
    {
      icon: Award,
      title: "Warranty & Returns",
      description: "Easy returns and comprehensive warranty coverage"
    },
    {
      icon: CreditCard,
      title: "Secure Online Payments",
      description: "Multiple payment options with bank-level security"
    },
    {
      icon: MessageCircle,
      title: "24/7 Live Chat Support",
      description: "Always available to help with your queries"
    }
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-glow-teal">Why Choose SCB?</h2>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Your trusted partner for gaming and PC building</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="glass-panel rounded-xl p-4 sm:p-6 hover-scale group cursor-pointer relative overflow-hidden"
          >
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 glow-teal" />

            {/* Content */}
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/30 transition-colors glow-teal">
                <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>

              <h3 className="text-base sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSCB;

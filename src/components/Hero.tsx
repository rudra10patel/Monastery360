import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/monastery-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Traditional Buddhist monastery in Sikkim mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-monastery-maroon/40 via-transparent to-mountain-blue/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="mb-8 animate-float">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 text-white">
            <span className="bg-gradient-monastery bg-clip-text text-transparent">
              Monastery360
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-4 leading-relaxed">
            A Digital Heritage Platform for Sikkim's Sacred Monasteries
          </p>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Experience ancient monasteries through immersive virtual tours, 
            explore digital archives, and discover the spiritual treasures of the Himalayas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="xl" className="animate-glow" asChild>
            <Link to="/tours">Explore Virtual Tours</Link>
          </Button>
          <Button variant="spiritual" size="xl" asChild>
            <Link to="/archives">Discover Archives</Link>
          </Button>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-3 h-3 bg-monastery-gold rounded-full animate-glow"></div>
        </div>
        <div className="absolute bottom-32 right-16 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-2 h-2 bg-sunrise rounded-full animate-glow"></div>
        </div>
      </div>
    </section>
  );
};
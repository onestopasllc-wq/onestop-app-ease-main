import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import cofunderimage from "@/assets/img_dagi.jpg";

const About = () => {
  const values = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Professionalism",
      description: "We maintain the highest standards of professionalism in every interaction, ensuring accuracy and reliability in all our services.",
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Accessibility",
      description: "We believe everyone deserves quality assistance. Our services are accessible and affordable to help you achieve your goals.",
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Accuracy",
      description: "Attention to detail is our priority. We ensure every application is thoroughly reviewed for completeness and accuracy.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <SEO
        title="About Us - Our Mission & Values"
        description="Learn about OneStop Application Services LLC, founded by Dagim Mulatu. Discover our mission to provide professional, accessible, and accurate application assistance."
      />
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-primary py-24 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              About OneStop
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in navigating complex application processes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
              <span className="text-secondary font-semibold">Our Mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary leading-tight">
              Empowering Success Through Simplified Applications
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-6">
              At OneStop Application Services LLC, we believe that complex paperwork shouldn't stand 
              between you and your dreams. Our mission is to provide professional, accessible, and 
              accurate assistance that transforms overwhelming application processes into manageable steps.
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We specialize in non-legal application support, guiding students and professionals 
              through visa forms, college admissions, document evaluations, licensing requirements, 
              job applications, and business registrations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Bio */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-elegant border-0 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0 items-stretch">
                  <div className="bg-gradient-primary p-0 flex items-stretch">
                    {/* Image column: use public/img_dagi.jpg (place image in public/) */}
                    <div className="w-full h-full">
                      <img
                        src={cofunderimage}
                        alt="Dagim Mulatu"
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.parentElement?.querySelector('.fallback') as HTMLElement | null;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                            // reveal as flex and center content
                            fallback.style.display = 'flex';
                            fallback.style.alignItems = 'center';
                            fallback.style.justifyContent = 'center';
                          }
                        }}
                      />

                      {/* Fallback if image is missing */}
                      <div className="fallback hidden w-full h-full bg-white/10">
                        <div className="text-6xl font-bold text-white">DM</div>
                      </div>

                      <div className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-white mb-2">Dagim Mulatu</h3>
                        <p className="text-white/80 text-lg">Founder & CEO</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-12">
                    <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
                      <span className="text-secondary font-semibold">Our Founder</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-primary">A Vision Born From Experience</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Dagim Mulatu founded OneStop Application Services LLC with a clear vision: 
                      to remove barriers and make professional opportunities accessible to everyone, 
                      regardless of their background or location.
                    </p>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Having navigated complex application processes personally, Dagim understands 
                      the challenges and frustrations that applicants face. This firsthand experience 
                      drives our commitment to providing supportive, accurate, and timely assistance.
                    </p>
                    <div className="border-l-4 border-secondary pl-6 py-2 mt-8">
                      <p className="text-lg italic text-primary font-medium">
                        "Success shouldn't be complicated. Our job is to make your journey 
                        as smooth as possible so you can focus on what truly matters – achieving your goals."
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
              <span className="text-secondary font-semibold">Our Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              What We Stand For
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our core values guide every decision we make and every service we provide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full shadow-card hover:shadow-hover transition-smooth hover:-translate-y-2 gradient-card border-0 group">
                  <CardContent className="pt-8 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 mx-auto group-hover:bg-secondary/20 transition-smooth text-secondary">
                      {value.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-primary">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24 px-4 gradient-primary">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Let's Start Your Journey
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Ready to simplify your application process? Get in touch with us today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+15716604984" className="text-white text-lg font-semibold hover:text-secondary transition-smooth">
                📞 +1 (571) 660-4984
              </a>
              <span className="text-white/50 hidden sm:inline">|</span>
              <a href="mailto:onestopapplicationservicesllc@gmail.com" className="text-white text-lg font-semibold hover:text-secondary transition-smooth">
                📧 Email Us
              </a>
              <span className="text-white/50 hidden sm:inline">|</span>
              <a href="https://t.me/OneStop_Application_Services_LLC" target="_blank" rel="noopener noreferrer" className="text-white text-lg font-semibold hover:text-secondary transition-smooth">
                💬 Telegram
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

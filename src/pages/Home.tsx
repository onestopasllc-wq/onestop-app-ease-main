import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, GraduationCap, Briefcase, Globe, UserCheck, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import heroBg from "@/assets/hero-image.png";
import AnimatedBackground from "@/components/AnimatedBackground";
import PromotionalPopup from "@/components/PromotionalPopup";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Testimonial {
  name: string;
  location: string | null;
  text: string;
  rating: number;
}

const Home = () => {
  const services = [
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Visa Form Assistance (Non-Legal)",
      description:
        "Expert support with visa application forms and documentation preparation. We guide you step-by-step to ensure accurate and complete submissions without providing legal advice.",
    },
    {
      icon: <GraduationCap className="w-12 h-12" />,
      title: "College & University Application Support",
      description:
        "Personalized assistance for domestic and international college and university applications. From program selection to application preparation, we help you present a strong and compelling profile.",
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Credential & Document Evaluation Support",
      description:
        "Professional guidance with all major credential evaluation services. We help you prepare, organize, and submit the required documents for smooth and timely evaluations.",
    },
    {
      icon: <UserCheck className="w-12 h-12" />,
      title: "Licensing Board Application Support",
      description:
        "Comprehensive assistance for exam registrations and professional licensing board applications. We help you understand requirements, prepare documents, and complete every step correctly.",
    },
    {
      icon: <Briefcase className="w-12 h-12" />,
      title: "Job Application & Career Support",
      description:
        "Strategic support for job applications, résumé preparation, and career readiness. We help you confidently apply to positions that match your skills and goals.",
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "Business License Application Support",
      description:
        "tComplete guidance for local, state, and federal business licensing requirements. We assist you in preparing forms, gathering documents, and submitting regulatory applications accurately.",
    },
  ];


  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("name, location, text, rating")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setTestimonials(data || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const features = [
    "Professional & Experienced Team",
    "Fast & Reliable Service",
    "Personalized Support",
    "Affordable Pricing",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <SEO />
      <Navbar />
      <PromotionalPopup />

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Professional application services"
            className="w-full h-full object-cover"
          />

        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4 px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full border border-secondary/30">
                <span className="text-white font-semibold">Trusted by Thousands</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                We Make Applying Easy! 🎓💼
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-white/95 leading-relaxed">
                Helping students and professionals simplify every application process with expert guidance and personalized support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/appointment">
                  <Button size="lg" className="text-lg px-8 py-6 shadow-elegant hover:shadow-hover transition-bounce group">
                    Book Appointment
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-smooth" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/95 hover:bg-cyan-700  border-2">
                    Our Services
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span className="font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
                <span className="text-secondary font-semibold">About Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
                Your Trusted Application Partner
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                OneStop Application Services LLC is dedicated to providing professional,
                accessible, and accurate assistance for all your application needs.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We simplify complex processes so you can focus on achieving your goals,
                whether it's studying abroad, advancing your career, or starting a business.
              </p>
              <Link to="/about">
                <Button size="lg" variant="outline" className="group">
                  Learn More About Us
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-smooth" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="shadow-card hover:shadow-hover transition-smooth">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">1000+</div>
                  <p className="text-muted-foreground">Happy Clients</p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-hover transition-smooth mt-8">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">6</div>
                  <p className="text-muted-foreground">Service Areas</p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-hover transition-smooth">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">95%</div>
                  <p className="text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-hover transition-smooth mt-8">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
                  <p className="text-muted-foreground">Support</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
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
              <span className="text-secondary font-semibold">Our Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Comprehensive Application Support
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From visa forms to business licenses, we provide expert assistance for every step of your application journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full shadow-card hover:shadow-hover transition-smooth hover:-translate-y-2 group gradient-card border-0">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-smooth text-secondary">
                      {service.icon}
                    </div>
                    <CardTitle className="text-2xl mb-3">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed mb-4">
                      {service.description}
                    </CardDescription>
                    <Link to="/services">
                      <Button variant="ghost" className="p-0 h-auto font-semibold text-secondary group-hover:text-primary">
                        Learn More
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-smooth" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" className="px-8">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
              <span className="text-secondary font-semibold">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real stories from real people who achieved their goals with our help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full shadow-card hover:shadow-hover transition-smooth border-0">
                    <CardContent className="pt-8">
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-5 h-5 fill-secondary"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-6 italic leading-relaxed text-lg">
                        "{testimonial.text}"
                      </p>
                      <div className="border-t pt-4">
                        <div className="font-bold text-primary text-lg">{testimonial.name}</div>
                        {testimonial.location && (
                          <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Check out our success stories to see how we help our clients.
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/testimonials">
              <Button variant="outline" size="lg">Read More Success Stories</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 gradient-primary">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Book your appointment today and take the first step toward achieving your goals.
            </p>
            <Link to="/appointment">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg shadow-elegant">
                Book Your Appointment Now
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

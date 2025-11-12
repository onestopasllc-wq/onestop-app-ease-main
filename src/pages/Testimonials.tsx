import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Mihret Walelgne",
      location: "Newark, DE, USA",
      service: "CGFNS Application Support",
      text: "OneStop Application Services LLC supported me through the CGFNS process. They were so helpful, patient, and professional! I couldn't have done it without their expert guidance. The team made a complex process feel manageable and stress-free.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      location: "Washington, DC",
      service: "Visa Application Support",
      text: "Amazing service! They helped me navigate the complex visa application process with ease and professionalism. Every document was perfectly organized, and they kept me informed at every step. Highly recommend!",
      rating: 5,
    },
    {
      name: "David Chen",
      location: "Arlington, VA",
      service: "Job Application Support",
      text: "Professional, efficient, and supportive. Highly recommend for anyone needing application assistance! They helped me optimize my resume and cover letters, and I landed my dream job within two months. Thank you!",
      rating: 5,
    },
    {
      name: "Maria Rodriguez",
      location: "Miami, FL",
      service: "College Application Support",
      text: "The team at OneStop helped my daughter get accepted to her top choice university. Their attention to detail and personalized guidance made all the difference. We're so grateful for their expertise!",
      rating: 5,
    },
    {
      name: "James Wilson",
      location: "New York, NY",
      service: "Licensing Board Application",
      text: "I was struggling with my nursing license application for months. OneStop took over and had everything organized and submitted within weeks. Their knowledge of the process saved me so much time and stress!",
      rating: 5,
    },
    {
      name: "Priya Patel",
      location: "San Francisco, CA",
      service: "Document Evaluation Support",
      text: "Getting my foreign credentials evaluated seemed impossible until I found OneStop. They knew exactly which agency to use and helped me gather all required documents. The process was smooth and efficient!",
      rating: 5,
    },
    {
      name: "Ahmed Hassan",
      location: "Houston, TX",
      service: "Business License Application",
      text: "Starting my business was made so much easier with OneStop's help. They guided me through all the licensing requirements and paperwork. Now my business is up and running, thanks to their support!",
      rating: 5,
    },
    {
      name: "Elena Popescu",
      location: "Chicago, IL",
      service: "Visa Application Support",
      text: "Professional service from start to finish. The team was responsive, knowledgeable, and genuinely cared about my success. My visa application was approved without any issues. Excellent work!",
      rating: 5,
    },
    {
      name: "Michael Brown",
      location: "Boston, MA",
      service: "Career Support",
      text: "The career readiness coaching I received was invaluable. They helped me rebrand myself professionally and craft compelling applications. I received multiple job offers and negotiated a better salary thanks to their advice!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <SEO
        title="Client Success Stories - Testimonials"
        description="Read real success stories from clients who achieved their goals with OneStop Application Services LLC. See why thousands trust us for application support."
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
              Success Stories
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Real people, real results. Read how we've helped clients achieve their goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Grid */}
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
              <span className="text-secondary font-semibold">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied clients who achieved their dreams with our help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full shadow-card hover:shadow-hover transition-smooth border-0 gradient-card">
                  <CardContent className="pt-8 flex flex-col h-full">
                    {/* Rating */}
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

                    {/* Service Badge */}
                    <div className="inline-block mb-4 px-3 py-1 bg-secondary/10 rounded-full self-start">
                      <span className="text-xs font-semibold text-secondary">
                        {testimonial.service}
                      </span>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-muted-foreground mb-6 italic leading-relaxed flex-grow">
                      "{testimonial.text}"
                    </p>

                    {/* Client Info */}
                    <div className="border-t pt-4 mt-auto">
                      <div className="font-bold text-primary text-lg">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Our Track Record
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: "1000+", label: "Happy Clients" },
              { number: "95%", label: "Success Rate" },
              { number: "6", label: "Service Areas" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-secondary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
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
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our growing list of satisfied clients and achieve your goals with expert guidance.
            </p>
            <Link to="/appointment">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg shadow-elegant">
                Book Your Appointment
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;

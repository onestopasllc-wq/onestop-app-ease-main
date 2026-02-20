import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, GraduationCap, Briefcase, Globe, UserCheck, Building2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";

const Services = () => {
  const [activeService, setActiveService] = useState<string | undefined>(undefined);
  
  const services = [
    {
      icon: <FileText className="w-16 h-16" />,
      title: "Visa Form Preparation (Non-Legal)",
      description: "Expert assistance with visa application forms and documentation.",
      details: [
        "Complete visa application form assistance",
        "Document checklist and organization",
        "Application review and verification",
        "Submission guidance and tracking",
        "Interview preparation support",
      ],
      note: "We provide non-legal assistance only. For legal advice, please consult an immigration attorney.",
    },
    {
      icon: <GraduationCap className="w-16 h-16" />,
      title: "College & University Application Support",
      description: "Comprehensive guidance through higher education admissions.",
      details: [
        "College selection and research assistance",
        "Application form completion support",
        "Essay review and feedback",
        "Transcript and document preparation",
        "Financial aid application guidance",
        "Deadline tracking and management",
      ],
    },
    {
      icon: <Globe className="w-16 h-16" />,
      title: "Document Evaluation Application Support",
      description: "Professional help with credential evaluation services.",
      details: [
        "Credential evaluation agency selection",
        "Application form assistance",
        "Document translation coordination",
        "Authentication and verification support",
        "Progress tracking and follow-up",
      ],
    },
    {
      icon: <UserCheck className="w-16 h-16" />,
      title: "Exam & Licensing Board Application Support",
      description: "Support for professional certification and licensing applications.",
      details: [
        "Licensing board application assistance",
        "Exam registration support",
        "Eligibility requirement review",
        "Documentation preparation",
        "Application status monitoring",
        "Renewal and continuing education tracking",
      ],
    },
    {
      icon: <Briefcase className="w-16 h-16" />,
      title: "Career Readiness & Job Application Support",
      description: "Strategic assistance for job seekers and career changers.",
      details: [
        "Resume and CV optimization",
        "Cover letter development",
        "LinkedIn profile enhancement",
        "Job search strategy consultation",
        "Application tracking system (ATS) optimization",
        "Interview preparation coaching",
      ],
    },
    {
      icon: <Building2 className="w-16 h-16" />,
      title: "Business License & Related Application Support",
      description: "Complete support for business registration and licensing.",
      details: [
        "Business entity selection guidance",
        "License and permit identification",
        "Application form completion",
        "Regulatory compliance assistance",
        "Renewal and update support",
        "Multi-jurisdictional applications",
      ],
    },
    
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <SEO
        title="Our Services - Expert Application Support"
        description="Comprehensive application support services including visa preparation, college applications, document evaluation, licensing boards, job applications, and business licenses. Expert guidance for every step."
        keywords="visa form preparation, college application support, document evaluation services, licensing board applications, job application help, business license support"
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
              Our Services
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Comprehensive application support tailored to your unique needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
              <span className="text-secondary font-semibold">What We Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Expert Assistance for Every Step
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From start to finish, we're here to guide you through complex application processes with expertise and care.
            </p>
          </motion.div>

          <Accordion 
            type="single" 
            collapsible 
            className="space-y-6"
            value={activeService}
            onValueChange={setActiveService}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="border rounded-2xl px-6 bg-card shadow-card hover:shadow-hover transition-smooth relative overflow-hidden group"
                >
                  <AccordionTrigger className="hover:no-underline py-6 group">
                    <div className="flex items-center gap-4 text-left">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-smooth text-secondary"
                        animate={activeService === `item-${index}` ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {service.icon}
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{service.title}</h3>
                        <p className="text-muted-foreground mt-1">{service.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AnimatePresence>
                    {activeService === `item-${index}` && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AccordionContent className="pt-4 pb-6">
                          <div className="pl-18">
                            <h4 className="font-semibold text-lg mb-4 text-primary flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-secondary" />
                              What's Included:
                            </h4>
                            <ul className="space-y-3 mb-6">
                              {service.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                                  <span className="text-muted-foreground">{detail}</span>
                                </li>
                              ))}
                            </ul>
                            {service.note && (
                              <div className="bg-secondary/10 rounded-xl p-4 mb-6">
                                <p className="text-sm text-muted-foreground italic">
                                  <strong>Note:</strong> {service.note}
                                </p>
                              </div>
                            )}
                            <Link to="/appointment">
                              <Button className="group hover:scale-105 transition-smooth">
                                Book This Service
                              </Button>
                            </Link>
                          </div>
                        </AccordionContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book your appointment today and let us help you navigate your application process with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/appointment">
                <Button size="lg" className="px-8">
                  Book Appointment
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;

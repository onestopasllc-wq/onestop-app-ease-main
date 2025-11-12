import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";

const FAQ = () => {
  const faqs = [
    {
      question: "What services do you offer?",
      answer: "We provide comprehensive non-legal application support services including: Visa Form Preparation, College & University Application Support, Document Evaluation Application Support, Exam & Licensing Board Application Support, Career Readiness & Job Application Support, and Business License & Related Application Support. Each service is designed to simplify complex application processes and increase your chances of success.",
    },
    {
      question: "Do you provide legal or immigration advice?",
      answer: "No, we do not provide legal advice. OneStop Application Services LLC offers non-legal assistance only. We help you complete application forms, organize documents, and navigate procedural requirements. For legal advice regarding immigration, visas, or other legal matters, we recommend consulting with a licensed attorney.",
    },
    {
      question: "How long does the process take?",
      answer: "The timeline varies depending on the type of service and the complexity of your application. Generally, document preparation and form completion can take 1-2 weeks. However, the overall timeline also depends on processing times from the relevant authorities (universities, licensing boards, government agencies, etc.). We'll provide you with a realistic timeline during your initial consultation.",
    },
    {
      question: "What documents are needed?",
      answer: "Required documents vary by service type. Generally, you'll need identification documents, educational transcripts, professional certificates, and any relevant application forms. During your consultation, we'll provide a detailed checklist specific to your needs. We recommend gathering documents early to avoid delays.",
    },
    {
      question: "How much do your services cost?",
      answer: "Our pricing varies based on the service complexity and scope. We require a $10 deposit to book an appointment, which goes toward your total service fee. After your consultation, we'll provide a detailed quote based on your specific needs. We offer competitive pricing and flexible payment options.",
    },
    {
      question: "Can you help with applications outside the United States?",
      answer: "Yes! While we're based in Virginia, we assist clients with applications worldwide. This includes international college admissions, credential evaluations for foreign degrees, and documentation for various international processes. Our virtual services make it easy to work with us regardless of your location.",
    },
    {
      question: "How do I book an appointment?",
      answer: "Booking is easy! Simply visit our Appointment page, fill out the booking form with your details and select your preferred date/time. You'll need to pay a $10 deposit to secure your appointment. Once confirmed, we'll send you a confirmation email with next steps and any documents to prepare.",
    },
    {
      question: "What if I need to reschedule my appointment?",
      answer: "We understand that schedules change. You can reschedule your appointment by contacting us via email, phone, or Telegram at least 24 hours in advance. We'll work with you to find a new time that fits your schedule.",
    },
    {
      question: "Do you offer rush services?",
      answer: "Yes, we offer expedited services for urgent applications. Rush service availability depends on our current workload and the complexity of your application. Additional fees apply for rush processing. Contact us to discuss your timeline and we'll do our best to accommodate your needs.",
    },
    {
      question: "How will I receive my completed documents?",
      answer: "We provide completed documents securely via email as PDF files. For applications that require original signatures or physical submission, we'll guide you through the signing and submission process. We can also arrange secure document shipping if needed (shipping fees apply).",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <SEO
        title="FAQ - Frequently Asked Questions"
        description="Find answers to common questions about our application services, pricing, timelines, and process. Get the information you need before booking."
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our services
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-secondary/10 rounded-full">
              <span className="text-secondary font-semibold">Got Questions?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              We Have Answers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Can't find what you're looking for? Contact us and we'll be happy to help.
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border rounded-2xl px-6 shadow-card hover:shadow-hover transition-smooth bg-gradient-card"
                >
                  <AccordionTrigger className="hover:no-underline py-6 text-left">
                    <h3 className="text-xl font-bold text-primary pr-4">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-24 px-4 bg-gradient-card">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Still Have Questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our team is here to help. Get in touch and we'll provide the answers you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="px-8">
                  Contact Us
                </Button>
              </Link>
              <Link to="/appointment">
                <Button size="lg" variant="outline" className="px-8">
                  Book Appointment
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

export default FAQ;

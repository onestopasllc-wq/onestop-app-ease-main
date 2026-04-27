import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";

const Privacy = () => {
    return (
        <div className="min-h-screen flex flex-col relative">
            <AnimatedBackground />
            <SEO
                title="Privacy Policy - OneStop Application Services LLC"
                description="Read our privacy policy to understand how we collect, use, and protect your personal information when using our application services."
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
                            Privacy Policy
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                            Your privacy and security are our top priorities.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Policy Content */}
            <section className="py-24 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="prose prose-lg max-w-none text-muted-foreground"
                    >
                        <div className="mb-12">
                            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Effective Date: February 23, 2026</p>
                            <h2 className="text-3xl font-bold text-primary mb-6">1. Introduction</h2>
                            <p>
                                OneStop Application Services LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you visit our website or use our mobile application.
                            </p>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">2. Information We Collect</h2>
                            <p>We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address.</li>
                                <li><strong>Application Data:</strong> Information required for your specific application service (visa forms, college applications, etc.).</li>
                                <li><strong>Payment Information:</strong> We use secure third-party processors (like Stripe) to handle payments. We do not store your full credit card details.</li>
                                <li><strong>Communication:</strong> Records of your interactions with us via email, phone, or Telegram.</li>
                            </ul>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">3. How We Use Your Information</h2>
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide and improve our application support services.</li>
                                <li>Process your appointments and payments.</li>
                                <li>Communicate with you about your applications and our services.</li>
                                <li>Comply with legal obligations.</li>
                            </ul>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">4. Data Security</h2>
                            <p>
                                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your data.
                            </p>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">5. Sharing of Information</h2>
                            <p>
                                We do not sell your personal information. We may share information with third-party service providers (such as Supabase for database management and Stripe for payment processing) who perform services on our behalf.
                            </p>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">6. Your Rights</h2>
                            <p>
                                Depending on your location, you may have the right to access, correct, or delete your personal information. You may also have the right to object to or restrict certain types of processing.
                            </p>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-primary mb-6">7. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="mt-4 p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
                                <p className="font-bold text-primary">OneStop Application Services LLC</p>
                                <p>Email: Info@onestopasllc.com</p>
                                <p>Phone: +1 (571) 660-4984</p>
                                <p>Location: Woodbridge, VA (Virtual Office)</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Privacy;

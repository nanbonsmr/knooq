import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground">
                We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our application and tell you about your privacy rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Data We Collect</h2>
              <p className="text-muted-foreground">We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Identity Data:</strong> Email address, username</li>
                <li><strong>Usage Data:</strong> Information about how you use our application</li>
                <li><strong>Content Data:</strong> Notes, highlights, and other content you create</li>
                <li><strong>Technical Data:</strong> Browser type, device information, IP address</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Data</h2>
              <p className="text-muted-foreground">We use your personal data for the following purposes:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To provide and maintain our service</li>
                <li>To manage your account and subscription</li>
                <li>To personalize your experience</li>
                <li>To communicate with you about updates and changes</li>
                <li>To improve our application and develop new features</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Data Security</h2>
              <p className="text-muted-foreground">
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those who have a genuine business need to access it.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for. When you delete your account, we will delete your personal data within 30 days.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Your Rights</h2>
              <p className="text-muted-foreground">Under certain circumstances, you have rights under data protection laws including:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>The right to access your personal data</li>
                <li>The right to correct inaccurate personal data</li>
                <li>The right to delete your personal data</li>
                <li>The right to object to processing of your personal data</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to track activity on our application and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

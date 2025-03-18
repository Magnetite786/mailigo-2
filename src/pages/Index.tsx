import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { 
  Mail, 
  Users, 
  FileSpreadsheet, 
  Send, 
  Clock, 
  CheckCircle, 
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      title: "CSV & Excel Support",
      description: "Import recipient emails directly from CSV or Excel files.",
      icon: FileSpreadsheet,
    },
    {
      title: "Manual Entry",
      description: "Add email addresses manually for more flexibility.",
      icon: Users,
    },
    {
      title: "Fast Delivery",
      description: "Send emails quickly using Nodemailer and Gmail integration.",
      icon: Clock,
    },
    {
      title: "No Email Limits",
      description: "Send to as many recipients as you need (subject to Gmail limits).",
      icon: Send,
    },
    {
      title: "User-Friendly",
      description: "Clean and intuitive interface makes bulk emailing simple.",
      icon: CheckCircle,
    },
    {
      title: "Secure",
      description: "Your Gmail app password is never stored on our servers.",
      icon: ShieldCheck,
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "For occasional use",
      features: [
        "Send up to 50 emails per day",
        "CSV & Excel import",
        "Basic templates",
        "Gmail integration",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Send unlimited emails",
        "Advanced templates",
        "Email tracking",
        "Scheduled sending",
        "Priority support",
      ],
      cta: "Get Started",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Send Bulk Emails <span className="text-primary">Effortlessly</span> Using Your Gmail Account
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way to send mass emails using your Gmail account. Import from CSV, add recipients manually, and send with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white text-lg py-6 px-8 rounded-lg shadow-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="#features">
              <Button variant="outline" className="text-lg py-6 px-8 rounded-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* App Demo/Screenshot Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-100 to-white p-2 md:p-8 rounded-xl shadow-xl">
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="text-sm text-muted-foreground ml-2">BulkMailer App</div>
              </div>
              <div className="p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sender Email</label>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipients</label>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">user1@example.com</div>
                        <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">user2@example.com</div>
                        <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">user3@example.com</div>
                        <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">+5 more</div>
                      </div>
                      <div className="h-10 bg-gray-100 rounded flex items-center justify-between px-3">
                        <span className="text-xs text-muted-foreground">Upload CSV/Excel</span>
                        <div className="w-24 bg-white rounded-sm h-6"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <div className="h-10 bg-gray-100 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <div className="h-40 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-32 h-10 bg-primary rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to send bulk emails efficiently using your Gmail account
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Send bulk emails in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Recipients</h3>
              <p className="text-muted-foreground">
                Upload a CSV/Excel file or add email addresses manually to create your recipient list.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compose Email</h3>
              <p className="text-muted-foreground">
                Write your email with a compelling subject line and engaging content.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Send & Track</h3>
              <p className="text-muted-foreground">
                Send your emails with a single click and monitor delivery status.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`rounded-xl overflow-hidden border ${
                  plan.popular ? 'shadow-lg border-primary' : 'shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button
                      className={`w-full ${
                        plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to simplify your email campaigns?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who trust BulkMailer for their email marketing needs.
            </p>
            <Link to="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white text-lg py-6 px-8 rounded-lg shadow-lg">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <span className="font-bold text-white text-xl">Bulk Mail</span>
              </div>
              <p className="text-sm">
                The most reliable bulk email service for businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
                <li>GDPR</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Bulk Mail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

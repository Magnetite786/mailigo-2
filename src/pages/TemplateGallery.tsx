import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Search, Filter, ArrowRight, Star, Copy, Eye, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TemplatePreviewModal } from "@/components/email/TemplatePreviewModal";
import { toast } from "sonner";

// Sample template data
const templates = [
  {
    id: 1,
    name: "Welcome Series",
    category: "Onboarding",
    description: "A warm welcome email series to engage new subscribers",
    preview: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #6366F1;">Welcome to [Company Name]! 👋</h2>
        <p>We're excited to have you on board. Here's what you can expect:</p>
        <ul>
          <li>Exclusive content</li>
          <li>Weekly updates</li>
          <li>Special offers</li>
        </ul>
        <button style="background: #6366F1; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Get Started</button>
      </div>
    `,
    tags: ["Welcome", "Onboarding", "Automated"],
    rating: 4.8,
    reviews: 245
  },
  {
    id: 2,
    name: "Product Launch",
    category: "Marketing",
    description: "Announce your new product with style and impact",
    preview: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #6366F1;">Introducing [Product Name] 🚀</h2>
        <p>The wait is over! We're thrilled to announce our latest innovation.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>Early Bird Offer</h3>
          <p>Get 20% off when you order in the next 48 hours!</p>
        </div>
        <button style="background: #6366F1; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Shop Now</button>
      </div>
    `,
    tags: ["Launch", "Promotion", "Sales"],
    rating: 4.9,
    reviews: 189
  },
  {
    id: 3,
    name: "Newsletter",
    category: "Content",
    description: "A clean and professional newsletter template",
    preview: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #6366F1;">[Company Name] Monthly Update</h2>
        <div style="margin: 20px 0;">
          <h3>📈 This Month's Highlights</h3>
          <ul>
            <li>Industry insights</li>
            <li>Company updates</li>
            <li>Featured content</li>
          </ul>
        </div>
        <button style="background: #6366F1; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Read More</button>
      </div>
    `,
    tags: ["Newsletter", "Updates", "Monthly"],
    rating: 4.7,
    reviews: 156
  },
  {
    id: 4,
    name: "Feedback Request",
    category: "Customer Success",
    description: "Gather valuable feedback from your customers",
    preview: `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #6366F1;">We Value Your Feedback!</h2>
        <p>Help us serve you better by sharing your experience.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p>Take our 2-minute survey and get a $10 coupon!</p>
        </div>
        <button style="background: #6366F1; color: white; padding: 10px 20px; border: none; border-radius: 5px;">Start Survey</button>
      </div>
    `,
    tags: ["Feedback", "Survey", "Customer Success"],
    rating: 4.6,
    reviews: 132
  }
];

const categories = ["All", "Onboarding", "Marketing", "Content", "Customer Success", "Sales", "Support"];

export default function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleUseTemplate = (template: any) => {
    // For non-logged in users, redirect to signup
    window.location.href = `/signup?template=${template.id}`;
  };

  const handleCopyTemplate = async (template: any) => {
    try {
      await navigator.clipboard.writeText(template.preview);
      toast.success("Template HTML copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy template. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Mail className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                MailiGo
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign up free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Email Templates
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Choose from our collection of professionally designed email templates. 
            Customize and start sending in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                type="search"
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={selectedCategory === category ? "bg-purple-600 text-white" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview */}
              <div className="relative h-64 border-b border-gray-200 overflow-hidden group">
                <div 
                  className="h-full w-full"
                  dangerouslySetInnerHTML={{ __html: template.preview }}
                />
                <div 
                  className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity cursor-pointer flex items-center justify-center"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(template.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({template.reviews} reviews)
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <div className="flex-1 flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCopyTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-purple-50 rounded-2xl p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to create stunning emails?
            </h2>
            <p className="text-gray-600 mb-6">
              Sign up now to access all templates and start creating beautiful email campaigns
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {selectedTemplate && (
        <TemplatePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          template={selectedTemplate}
        />
      )}
    </div>
  );
} 
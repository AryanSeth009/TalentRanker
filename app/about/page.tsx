import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Zap, Shield, Users, CheckCircle, Star, Target, Clock, BarChart3, FileText } from "lucide-react"
import Navigation from "../components/navigation"

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description:
        "State-of-the-art machine learning algorithms analyze resumes against job descriptions with 95% accuracy for precise candidate matching.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description:
        "Process hundreds of resumes in minutes, not hours. Get comprehensive results instantly with our optimized AI engine.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-level encryption and security. Your data is protected with SOC 2 compliance and never stored permanently without consent.",
    },
    {
      icon: Users,
      title: "HR Team Optimized",
      description:
        "Built specifically for HR professionals with intuitive workflows, collaborative features, and detailed candidate insights.",
    },
    {
      icon: Target,
      title: "Precision Matching",
      description:
        "Advanced semantic analysis matches candidates based on skills, experience, and cultural fit indicators.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description:
        "Comprehensive reports with match scores, skill gaps, and hiring recommendations to make informed decisions.",
    },
  ]

  const benefits = [
    "Reduce screening time by 90%",
    "Eliminate unconscious bias in hiring",
    "Identify top candidates quickly",
    "Detailed match analysis and scoring",
    "Export and share results seamlessly",
    "Track hiring analytics and trends",
    "Batch process multiple positions",
    "Integration with popular ATS systems",
    "Custom scoring criteria setup",
    "Real-time collaboration features",
    "Mobile-responsive dashboard",
    "24/7 customer support",
  ]

  const stats = [
    { number: "50,000+", label: "Resumes Analyzed", icon: FileText },
    { number: "2,500+", label: "Companies Trust Us", icon: Users },
    { number: "95%", label: "Accuracy Rate", icon: Target },
    { number: "90%", label: "Time Saved", icon: Clock },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director at TechCorp",
      content:
        "TalentRanker.ai has transformed our hiring process. We've reduced screening time by 85% while finding better candidates.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Talent Acquisition Manager",
      content:
        "The AI analysis is incredibly accurate. It catches details we might miss and provides valuable insights.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Recruiting Lead at StartupXYZ",
      content: "Perfect for fast-growing companies. We can now handle 10x more applications with the same team size.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
                <Brain className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">About TalentRanker.ai</h1>
                <div className="text-lg text-blue-600 font-medium mt-1">Revolutionizing Recruitment</div>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Revolutionizing recruitment with cutting-edge AI technology. Help HR professionals find the perfect
              candidates faster, more accurately, and with greater confidence than ever before.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Trusted by 2,500+ Companies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>50,000+ Resumes Analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>95% Accuracy Rate</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-600">Everything you need for modern recruitment</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-900 mb-2">Why Choose TalentRanker.ai?</CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Transform your hiring process with these powerful benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600">Simple, powerful, and effective</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Upload Resumes</h3>
                <p className="text-gray-600">Upload multiple PDF or DOCX resume files with drag-and-drop simplicity</p>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Add Job Description</h3>
                <p className="text-gray-600">
                  Paste your complete job description with requirements and qualifications
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900">Get AI Results</h3>
                <p className="text-gray-600">Review ranked candidates with detailed analysis and match scores</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          {/* <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-lg text-gray-600">Trusted by HR professionals worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 italic">"{testimonial.content}"</p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}

          {/* CTA Section */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-green-600 text-white text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Ready to Transform Your Hiring?</h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                  Join thousands of HR professionals who trust TalentRanker.ai for their recruitment needs. Start finding
                  better candidates faster today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                  <Brain className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
                >
                  Schedule Demo
                </Button>
              </div>
              <div className="text-sm text-blue-200 pt-4">
                No credit card required • 14-day free trial • Cancel anytime
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

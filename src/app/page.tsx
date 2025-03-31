'use client'

import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, CloudLightning, Compass, LifeBuoy, MapPin, Shield, Users, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import RegisterForm from "./register/register-form"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col scroll-smooth">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/hurrinet_logo.png" 
                alt="HurriNet Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">HurriNet</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('alerts')} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Alerts
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Contact
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
          {/* Left side - Registration Form */}
          <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 bg-muted">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="flex items-center gap-2">
                <Image 
                  src="/hurrinet_logo.png" 
                  alt="HurriNet Logo" 
                  width={32} 
                  height={32} 
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold">HurriNet</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Join Saint Lucia's Hurricane Network</h1>
                <p className="mt-2 text-muted-foreground">
                  Get real-time alerts and stay prepared during hurricane season
                </p>
              </div>
              <RegisterForm />
              <div className="pt-8 border-t">
                <div className="text-center space-y-4">
                  <h2 className="text-lg font-semibold">Are you Emergency Response Personnel?</h2>
                  <p className="text-sm text-muted-foreground">
                    If you are Emergency Personnel, a Resource Manager, or Medical Personnel, 
                    please use our specialized registration process.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/onboarding')}
                  >
                    Register as Emergency Personnel
                  </Button>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline underline-offset-4">
                  Log in
                </Link>
              </div>
            </div>
          </div>

          {/* Right side - Hero Content */}
          <div className="relative flex items-center bg-gradient-to-b from-blue-50 to-blue-100 p-6 lg:p-8">
            <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
              <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm mb-8">
                <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-blue-800">Saint Lucia's Official Hurricane Network</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none mb-6">
                Stay Safe from Hurricanes in Saint Lucia
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Access real-time alerts, evacuation routes, and emergency resources for Saint Lucia's
                communities.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg border bg-background/60 backdrop-blur p-4">
                  <CloudLightning className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Storm Tracking</h3>
                  <p className="text-sm text-muted-foreground">Real-time hurricane and tropical storm monitoring</p>
                </div>
                <div className="rounded-lg border bg-background/60 backdrop-blur p-4">
                  <Waves className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Flood Alerts</h3>
                  <p className="text-sm text-muted-foreground">Early warnings for vulnerable areas</p>
                </div>
              </div>
              <div className="mt-8 flex items-center text-sm">
                <Image 
                  src="/hurrinet_logo.png" 
                  alt="HurriNet Logo" 
                  width={16} 
                  height={16} 
                  className="h-4 w-4 mr-2"
                />
                <span>Trusted by NEMO and local emergency response teams</span>
              </div>
            </div>
            
            <div 
              style={{ 
                backgroundImage: "url('/hurricane.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3
              }} 
              className="absolute inset-0" 
            />
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Comprehensive Disaster Preparedness</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides essential tools and resources to help Saint Lucians prepare for, respond to, and
                  recover from natural disasters.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CloudLightning className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Storm Tracking</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Real-time monitoring of hurricanes and tropical storms affecting Saint Lucia
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Waves className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Flood Alerts</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Early warnings for potential flooding in vulnerable areas across the island
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <MapPin className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Evacuation Routes</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Detailed evacuation plans and shelter locations for each community
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Community</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Connect with neighbors and local emergency response teams
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Saint Lucia Needs HurriNet</h2>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 rounded-full bg-primary p-1">
                      <Compass className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Geographic Vulnerability</h3>
                      <p className="text-sm text-muted-foreground">
                        Saint Lucia's location in the hurricane belt makes it particularly susceptible to tropical
                        storms and hurricanes.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 rounded-full bg-primary p-1">
                      <Waves className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Coastal Risks</h3>
                      <p className="text-sm text-muted-foreground">
                        Rising sea levels and storm surges threaten coastal communities and critical infrastructure.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 rounded-full bg-primary p-1">
                      <CloudLightning className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Increasing Storm Intensity</h3>
                      <p className="text-sm text-muted-foreground">
                        Climate change is leading to more frequent and severe weather events affecting the island.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="rounded-lg border bg-background p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Our Mission</h3>
                  <p className="mt-2 text-muted-foreground">
                    To provide Saint Lucians with the tools, information, and resources they need to prepare for and
                    respond to natural disasters, ultimately saving lives and protecting communities.
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-6 shadow-sm">
                  <h3 className="text-xl font-bold">Government Partnership</h3>
                  <p className="mt-2 text-muted-foreground">
                    Working in collaboration with Saint Lucia's National Emergency Management Organization (NEMO) to
                    ensure coordinated disaster response efforts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="alerts" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Current Alert Status</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Stay informed with the latest weather and disaster alerts for Saint Lucia
                </p>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-3xl rounded-lg border bg-background p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-100 p-2">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Current Status: Normal</h3>
                    <p className="text-sm text-muted-foreground">No active weather alerts for Saint Lucia</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-700">Weather Forecast</h4>
                  <p className="mt-1 text-sm">Partly cloudy with occasional showers</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-700">Hurricane Season</h4>
                  <p className="mt-1 text-sm">Active (June 1 - November 30)</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-700">Preparedness Level</h4>
                  <p className="mt-1 text-sm">Standard readiness recommended</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Register or log in to receive personalized alerts based on your location in Saint Lucia
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Contact Us</h2>
                <p className="mt-4 text-muted-foreground">Have questions about HurriNet? Our team is here to help.</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="text-sm text-muted-foreground">
                        NEMO Headquarters, Bisee Highway, Castries, Saint Lucia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <LifeBuoy className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">Emergency Hotline</h3>
                      <p className="text-sm text-muted-foreground">758-452-3802</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm">
                <h3 className="text-xl font-bold">Send Us a Message</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="first-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        First name
                      </label>
                      <input
                        id="first-name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="last-name"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Last name
                      </label>
                      <input
                        id="last-name"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button>Send Message</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background py-6 md:py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2">
            <Image 
              src="/hurrinet_logo.png" 
              alt="HurriNet Logo" 
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="text-lg font-bold">HurriNet</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Final Year Project for the University of London Computer Science BSc.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/remyfrancis/HurriNet" className="text-sm text-muted-foreground hover:text-foreground">
              Project GitHub
            </Link>
            <Link href="/final-report.pdf" className="text-sm text-muted-foreground hover:text-foreground">
              Final Report
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}





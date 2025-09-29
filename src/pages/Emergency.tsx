import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Shield,
  Heart,
  Users,
  Car,
  Building,
  ExternalLink
} from "lucide-react";

const emergencyContacts = [
  {
    name: "Local Police",
    number: "100",
    description: "Emergency police assistance",
    icon: Shield,
    priority: "high"
  },
  {
    name: "Ambulance",
    number: "108",
    description: "Medical emergency & ambulance",
    icon: Heart,
    priority: "high"
  },
  {
    name: "Fire Services",
    number: "101",
    description: "Fire & rescue services",
    icon: AlertTriangle,
    priority: "high"
  },
  {
    name: "Women Helpline",
    number: "1091",
    description: "Women safety helpline",
    icon: Users,
    priority: "medium"
  }
];

const emergencyProcedures = [
  {
    title: "Medical Emergency",
    steps: [
      "Call 108 for ambulance immediately",
      "Inform nearby staff/security",
      "Stay with the person if safe to do so",
      "Clear the area for emergency personnel",
      "Provide first aid if trained"
    ],
    icon: Heart
  },
  {
    title: "Fire Emergency",
    steps: [
      "Call 101 for fire department",
      "Activate nearest alarm if available",
      "Evacuate the building immediately",
      "Use emergency exits only",
      "Assemble at designated point"
    ],
    icon: AlertTriangle
  },
  {
    title: "Security Incident",
    steps: [
      "Call 100 for police",
      "Contact on-site security",
      "Move to a safe location",
      "Do not confront the threat",
      "Follow security instructions"
    ],
    icon: Shield
  }
];

const nearbyFacilities = [
  {
    name: "Nearest Hospital",
    distance: "~3 km",
    address: "Primary care and emergency services",
    phone: "+91 0000 000000",
    services: "ICU, Ambulance, Emergency care",
    icon: Heart,
    directions: "https://www.google.com/maps"
  },
  {
    name: "Police Station",
    distance: "~2 km",
    address: "24/7 Police assistance",
    phone: "+91 0000 000000",
    services: "FIR registration, Security",
    icon: Shield,
    directions: "https://www.google.com/maps"
  },
  {
    name: "Bus Stand",
    distance: "~1.5 km",
    address: "Public transport, Emergency evacuation",
    phone: "+91 0000 000000",
    services: "Local and long distance",
    icon: Car,
    directions: "https://www.google.com/maps"
  }
];

const Emergency = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section styled like Smart Audio Guides */}
        <section className="pt-24 pb-8 bg-gradient-to-br from-monastery-gold/10 to-background dark:from-monastery-gold/20 dark:to-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                <span className="bg-gradient-monastery bg-clip-text text-transparent">Emergency Information</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience immersive audio guided tour covering architecture, history, and spiritual significance. Available in multiple languages with offline mode for remote monastery visits.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          <section className="mb-16">
            <div className="bg-destructive/5 border-2 border-destructive/30 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <h2 className="text-3xl font-bold">Urgent Emergency Contacts</h2>
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-base opacity-80 font-medium">
                  Call these numbers immediately in case of life‑threatening emergencies
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-card rounded-xl p-6 border">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                        <contact.icon className="w-8 h-8 text-destructive-foreground" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{contact.name}</h3>
                      <div className="text-3xl font-bold text-destructive mb-3">{contact.number}</div>
                      <p className="text-sm text-muted-foreground mb-4">{contact.description}</p>
                      <Button className="w-full" onClick={() => window.open(`tel:${contact.number.replace(/[^\d+]/g, '')}`, "_self")}>
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Emergency Procedures</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {emergencyProcedures.map((procedure, index) => (
                <Card key={index} className="bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <procedure.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{procedure.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3 list-decimal list-inside">
                      {procedure.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Nearby Emergency Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyFacilities.map((facility, index) => (
                <Card key={index} className="bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <facility.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <span className="text-sm text-muted-foreground">{facility.distance} away</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-1" />
                        <span className="text-sm">{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{facility.phone}</span>
                      </div>
                      <CardDescription className="text-sm">
                        <strong>Services:</strong> {facility.services}
                      </CardDescription>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const phoneNumber = facility.phone.replace(/[^\d+]/g, "");
                            window.open(`tel:${phoneNumber}`, "_self");
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(facility.directions, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <Card className="bg-amber-50/50 dark:bg-amber-900/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Important Safety Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>Always follow staff/security instructions during emergencies</li>
                  <li>Keep emergency numbers saved: 100, 101, 108, 1091</li>
                  <li>Familiarize yourself with emergency exits upon arrival</li>
                  <li>Report suspicious activity to security immediately</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="text-center pb-8">
            <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => window.open("tel:100", "_self")}>
                <Phone className="w-5 h-5 mr-2" />
                Call Emergency (100)
              </Button>
              <Button variant="secondary" size="lg" onClick={() => window.open("tel:108", "_self")}>
                <Phone className="w-5 h-5 mr-2" />
                Call Ambulance (108)
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.open("tel:101", "_self")}>
                <Phone className="w-5 h-5 mr-2" />
                Call Fire (101)
              </Button>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Emergency;



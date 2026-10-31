export const contactContent = {
  hero: {
    badge: "GET IN TOUCH",
    title: "Contact Us",
    description:
      "Questions about enrolment, fees, or a campus visit? Real people answer here — usually the same day."
  },
  channels: {
    badge: "TALK TO THE RIGHT PEOPLE",
    title: "One school, dedicated front doors",
    description:
      "Skip the switchboard — reach the team that can actually help, whether it is enrolment, fees, or a quick question on WhatsApp.",
    items: [
      {
        id: "admissions",
        icon: "GraduationCap",
        title: "Admissions",
        description:
          "Applications, entrance assessments, and enrolment for new students.",
        email: "admissions@sunrisemodel.edu.bd",
        phone: "+880 1865-779217",
        actionText: "Email admissions",
        actionLink: "mailto:admissions@sunrisemodel.edu.bd?subject=Admissions%20Enquiry"
      },
      {
        id: "enquiries",
        icon: "Building2",
        title: "General Enquiries",
        description:
          "School life, academic programs, activities, and anything else on your mind.",
        email: "info@sunrisemodel.edu.bd",
        phone: "+880 1865-779218",
        actionText: "Email the office",
        actionLink: "mailto:info@sunrisemodel.edu.bd?subject=General%20Enquiry"
      },
      {
        id: "accounts",
        icon: "CreditCard",
        title: "Fees & Accounts",
        description:
          "Fee schedules, payment plans, scholarships, and payment receipts.",
        email: "accounts@sunrisemodel.edu.bd",
        phone: "Sun – Thu, 8:00 – 15:30",
        actionText: "Email accounts",
        actionLink: "mailto:accounts@sunrisemodel.edu.bd?subject=Fee%20Query"
      },
      {
        id: "whatsapp",
        icon: "MessageCircle",
        title: "WhatsApp Line",
        description:
          "Quick questions answered on school days between 8:00 and 16:00.",
        phone: "+880 1865-779219",
        subtext: "Replies within school hours",
        actionText: "Chat on WhatsApp",
        actionLink: "https://wa.me/8801865779218?text=Hello%20Sunrise%20School%2C%20I%20have%20an%20enquiry"
      }
    ]
  },
  formSection: {
    badge: "SEND A MESSAGE",
    title: "Tell us how we can help",
    description:
      "Fill in the form and the right team member will get back to you within two working days — usually much sooner.",
    subjects: [
      "Admissions & enrolment",
      "Book a campus tour",
      "Fees, tuition & payment plans",
      "Academic curriculum & syllabus",
      "General question"
    ],
    officeHours: {
      title: "Office hours",
      schedule: [
        { days: "Sunday – Thursday", hours: "7:30 – 16:30" },
        { days: "Saturday", hours: "9:00 – 12:30 (admissions only)" },
        { days: "Friday & public holidays", hours: "Closed" }
      ]
    },
    visitCard: {
      title: "Prefer to see it in person?",
      description:
        "Campus tours run every school day from 9:00 to 14:00. Come and watch a normal school day — no polish, no rehearsal.",
      phone: "+880 1865-779218",
      email: "admissions@sunrisemodel.edu.bd"
    }
  },
  campusMap: {
    badge: "FIND US",
    title: "One campus, one warm welcome",
    description:
      "Drop by our campus — call ahead so we can have someone waiting at the gate for you.",
    campus: {
      tag: "CHATTOGRAM CAMPUS",
      name: "Muradpur Main Campus",
      address: "CDA Avenue, Muradpur, Chattogram 4204, Bangladesh",
      landmark: "Near Muradpur intersection & flyover, CDA Avenue",
      phone: "+880 1865-779218",
      email: "campus@sunrisemodel.edu.bd",
      directionsUrl: "https://www.google.com/maps/search/?api=1&query=Muradpur,+Chattogram,+Bangladesh",
      embedUrl: "https://maps.google.com/maps?q=Muradpur%2C%20Chattogram%2C%20Bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed"
    }
  },
  faqs: {
    badge: "BEFORE YOU ASK",
    title: "Questions we hear every week",
    description:
      "If yours is not here, the form above reaches a real person — not an inbox that nobody checks.",
    items: [
      {
        question: "When can my child join Sunrise Model School?",
        answer:
          "Our main academic session begins every January, with early admission applications opening in October. Mid-term admissions for students transferring into Muradpur are welcomed subject to seat availability in the corresponding class."
      },
      {
        question: "Can we visit the campus before applying?",
        answer:
          "Absolutely! We encourage parents and students to visit our Muradpur campus on any school day between 9:00 AM and 2:00 PM. You can tour our facilities, see classrooms in action, and meet our academic coordinators."
      },
      {
        question: "How quickly will I get a response?",
        answer:
          "Form submissions and emails are answered within one business day. If you reach out through our official WhatsApp line during school hours (8:00 AM – 4:00 PM), our team typically responds within 15–30 minutes."
      },
      {
        question: "Do you offer scholarships or payment plans?",
        answer:
          "Yes. We offer merit scholarships for high academic or co-curricular performance, sibling discounts for families with multiple enrolled children, and flexible monthly/quarterly tuition payment schedules."
      },
      {
        question: "Where exactly is the campus located in Muradpur?",
        answer:
          "We are located centrally on CDA Avenue in Muradpur, Chattogram, right beside the Muradpur junction. It is easily accessible via public transit, auto-rickshaw, or private vehicle with convenient drop-off points."
      }
    ]
  },
  nextStepBanner: {
    badge: "WE ARE READY WHEN YOU ARE",
    title: "The next step is a conversation",
    description:
      "Call, write, or walk in — every great Sunrise journey starts with a family saying hello.",
    primaryCta: {
      text: "Explore our programs",
      href: "#programs"
    },
    secondaryCta: {
      text: "Schedule a campus tour",
      href: "#contact-form"
    }
  }
};


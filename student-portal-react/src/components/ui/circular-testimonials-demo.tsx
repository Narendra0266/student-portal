import React from "react";
import { CircularTestimonials } from '@/components/ui/circular-testimonials';

const testimonials = [
  {
    quote:
      "I was impressed by the food! And I could really tell that they use high-quality ingredients. The staff was friendly and attentive. I'll definitely be back for more!",
    name: "Tamar Mendelson",
    designation: "Restaurant Critic",
    src:
      "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "This place exceeded all expectations! The atmosphere is inviting, and the staff truly goes above and beyond. I'll keep returning for more exceptional dining experience.",
    name: "Joe Charlescraft",
    designation: "Frequent Visitor",
    src:
      "https://images.unsplash.com/photo-1628749528992-f5702133b686?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Shining Yam is a hidden gem! The impeccable service and overall attention to detail created a memorable experience. I highly recommend it!",
    name: "Martina Edelweist",
    designation: "Satisfied Customer",
    src:
      "https://images.unsplash.com/photo-1524267213992-b76e8577d046?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The strategic insights and operational execution provided by this team transformed our workflow completely. Efficiency increased by nearly 40% in just two quarters.",
    name: "Sarah Connor",
    designation: "Operations Director",
    src:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Building our interface with these components has been an absolute breeze. The modular structure and performance optimization saved us weeks of development time.",
    name: "David Chen",
    designation: "Software Engineer",
    src:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The visual polish and attention to detail are world-class. It's rare to find tools that balance aesthetic design with robust accessibility so seamlessly.",
    name: "Emily Watson",
    designation: "Product Designer",
    src:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "A truly remarkable service experience. The onboarding process was seamless, and the ongoing support has been incredibly proactive and helpful.",
    name: "Marcus Aurelius",
    designation: "Creative Director",
    src:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Our customer acquisition costs fell significantly since we started using this platform. The marketing tools built into the dashboard are exceptionally powerful.",
    name: "Jessica Taylor",
    designation: "Marketing Specialist",
    src:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Working with this architecture is a developer's dream. It's fast, predictable, and extremely clean. I'm recommending it to all our engineering departments.",
    name: "Alexander Wright",
    designation: "Lead Developer",
    src:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The talent acquisition pipeline we established using this new software has made hiring incredibly efficient. The automated sorting works like magic.",
    name: "Sophia Martinez",
    designation: "HR Consultant",
    src:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "We ran extensive user interviews, and the feedback on the new interaction flows was overwhelmingly positive. The transitions are incredibly smooth.",
    name: "Daniel Kim",
    designation: "UX Researcher",
    src:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Our investment forecasting models have become significantly more accurate. The platform provides incredibly rich data visualization options.",
    name: "Olivia Hansen",
    designation: "Financial Advisor",
    src:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The quantitative breakdowns and business intelligence suites are superb. They help us identify hidden bottlenecks in our supply chain easily.",
    name: "Robert Vance",
    designation: "Business Analyst",
    src:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Analyzing massive datasets has never been so fast. The backend processing power and query speeds exceeded all our expectations.",
    name: "Chloe Nakamura",
    designation: "Data Scientist",
    src:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "This solution streamlined our operations from warehouse logistics to final distribution. A must-have tool for any modern retail business.",
    name: "Thomas Shelby",
    designation: "Operations Lead",
    src:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Our content outreach saw a 3x engagement increase after adopting these layout optimizations. The readability metrics improved instantly.",
    name: "Elena Rostova",
    designation: "Content Strategist",
    src:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The safety protocols and system security architecture are incredibly robust. I feel completely secure hosting all our confidential archives here.",
    name: "Liam Neeson",
    designation: "Security Specialist",
    src:
      "https://images.unsplash.com/photo-1504257404764-52525a4ab69e?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The architectural design system provides a magnificent sense of scale and proportion. It allows for highly creative spatial configurations.",
    name: "Maya Lin",
    designation: "Architect",
    src:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "I've overseen hundreds of digital campaigns, and this is by far the most reliable platform we've ever used. Performance is always top-notch.",
    name: "Arthur Pendragon",
    designation: "Executive Producer",
    src:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Client retention has gone up since we integrated this portal. The communication features keep our clients updated automatically.",
    name: "Isabella Cruz",
    designation: "Account Manager",
    src:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "We were able to pivot our market strategy smoothly using the trend-spotting dashboards. Highly recommended for growth teams.",
    name: "William Sterling",
    designation: "Strategy Consultant",
    src:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The automation pipelines and containerization tools are fantastic. Deployment times went down from hours to minutes.",
    name: "Lucas Silva",
    designation: "DevOps Engineer",
    src:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "As a brand ambassador, I'm proud to support a product that is so customer-focused and visually stunning. Truly an outstanding job.",
    name: "Natalie Portman",
    designation: "Brand Ambassador",
    src:
      "https://images.unsplash.com/photo-1534751516642-a131ffd107fd?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Deploying our applications natively across platforms has never been so seamless. The UI remains pixel-perfect on both mobile and web.",
    name: "Jacob Fletcher",
    designation: "Mobile Developer",
    src:
      "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "The feedback loops we opened with our audience using these tools have improved our brand image and public relations tremendously.",
    name: "Gabriela Santos",
    designation: "Public Relations",
    src:
      "https://images.unsplash.com/photo-1586297135537-94bc9ba553ca?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Managing multi-layered project scopes is highly organized now. Tasks and deadlines are perfectly aligned across cross-functional teams.",
    name: "Ethan Hunt",
    designation: "Project Coordinator",
    src:
      "https://images.unsplash.com/photo-1489980508314-941910ded1f4?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Documenting our API interfaces became extremely simple. The automatic generation templates are clean and easy for developers to follow.",
    name: "Victoria Sterling",
    designation: "Technical Writer",
    src:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Our systems analytics show amazing stability since migration. Downtime has been reduced to absolute zero.",
    name: "Grace Hopper",
    designation: "Systems Analyst",
    src:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Finding assets and managing digital content is highly streamlined. The search functionality saves us hours of scrolling.",
    name: "Christian Bale",
    designation: "Art Director",
    src:
      "https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=600&auto=format&fit=crop",
  },
  {
    quote:
      "Structuring complex data logic has become a highly visual and intuitive process. It makes teaching data science a pleasure.",
    name: "Ada Lovelace",
    designation: "Mathematics Professor",
    src:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop",
  },
];

export const CircularTestimonialsDemo = () => (
  <section className="w-full">
    {/* Light testimonials section */}
    <div className="bg-[#f7f7fa] p-20 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative">
      <div
        className="items-center justify-center relative flex"
        style={{ maxWidth: "1456px" }}
      >
        <CircularTestimonials
          testimonials={testimonials}
          autoplay={true}
          colors={{
            name: "#0a0a0a",
            designation: "#454545",
            testimony: "#171717",
            arrowBackground: "#141414",
            arrowForeground: "#f1f1f7",
            arrowHoverBackground: "#00A6FB",
          }}
          fontSizes={{
            name: "28px",
            designation: "20px",
            quote: "20px",
          }}
        />
      </div>
    </div>

    {/* Dark testimonials section */}
    <div className="bg-[#060507] p-16 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative mt-8">
      <div
        className="items-center justify-center relative flex"
        style={{ maxWidth: "1024px" }}
      >
        <CircularTestimonials
          testimonials={testimonials}
          autoplay={true}
          colors={{
            name: "#f7f7ff",
            designation: "#e1e1e1",
            testimony: "#f1f1f7",
            arrowBackground: "#0582CA",
            arrowForeground: "#141414",
            arrowHoverBackground: "#f7f7ff",
          }}
          fontSizes={{
            name: "28px",
            designation: "20px",
            quote: "20px",
          }}
        />
      </div>
    </div>
  </section>
);

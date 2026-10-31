import TopStrip from '../../../components/TopStrip';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { Sparkles, Trophy } from 'lucide-react';

export default function ActivitiesPage() {
  const clubs = [
    {
      category: "STEM & TECHNOLOGY",
      title: "Science & Robotics Club",
      description:
        "Hands-on coding, Arduino builds, science fair exhibits, and national Olympiad preparation.",
      schedule: "Tuesdays & Thursdays, 3:30 – 5:00 PM",
      achievements: "1st Place, Regional Science Olympiad 2025"
    },
    {
      category: "ORATORY & LEADERSHIP",
      title: "Debate & Model UN Society",
      description:
        "Sharpening critical rhetoric, public speaking, diplomatic negotiation, and current affairs analysis in both Bangla and English.",
      schedule: "Mondays & Wednesdays, 3:30 – 5:00 PM",
      achievements: "National English Debate Finalists"
    },
    {
      category: "PHYSICAL WELLNESS",
      title: "Sports & Athletics Teams",
      description:
        "Competitive football, cricket, badminton, basketball, and track-and-field coaching with dedicated physical educators.",
      schedule: "Daily morning & afternoon training sessions",
      achievements: "12 Gold Medals, Inter-School Athletics Meet"
    },
    {
      category: "CREATIVE ARTS",
      title: "Music, Drama & Fine Arts",
      description:
        "Vocal and instrumental training, theatrical productions, traditional folk arts, and annual cultural showcase festivals.",
      schedule: "Wednesdays & Saturdays",
      achievements: "Grand Prize, National Youth Arts Festival"
    },
    {
      category: "CIVIC IMPACT",
      title: "Scouts & Community Service",
      description:
        "Community clean-ups, flood relief drives, leadership camps, and civic volunteerism in and around Chattogram.",
      schedule: "Alternate Saturdays & field expeditions",
      achievements: "President’s Scout Award Nominees"
    },
    {
      category: "LITERATURE & MEDIA",
      title: "School Journalism & Editorial",
      description:
        "Publishing the quarterly school magazine, campus photography, creative writing workshops, and student newsletters.",
      schedule: "Bi-weekly editorial meets",
      achievements: "Annual Sunrise Chronicle Publication"
    }
  ];

  return (
    <>
      <TopStrip />
      <Header />
      <main className="subpage-main">
        {/* Activities Hero */}
        <section className="subpage-hero">
          <div className="w">
            <span className="contact-pill">
              <Sparkles size={14} />
              CO-CURRICULARS & CULTURE
            </span>
            <h1 className="subpage-heading">
              Passions discovered, <em>talents unleashed.</em>
            </h1>
            <p className="subpage-subtitle">
              Education at Sunrise reaches far beyond textbooks. Our vibrant clubs, athletics, and
              creative arts give every student the stage to excel.
            </p>
          </div>
        </section>

        {/* Clubs Grid */}
        <section className="subpage-section">
          <div className="w">
            <div className="sh">
              <div>
                <span className="eb">CLUBS & SOCIETIES</span>
                <h2>Explore your student life</h2>
              </div>
              <p>
                From robotics labs to athletics grounds, students participate in programs that cultivate
                teamwork, leadership, and joy.
              </p>
            </div>

            <div className="activities-grid">
              {clubs.map((club) => (
                <div key={club.title} className="activity-card">
                  <span className="activity-cat-tag">{club.category}</span>
                  <h3 className="activity-title">{club.title}</h3>
                  <p className="activity-desc">{club.description}</p>

                  <div className="activity-meta-box">
                    <div className="act-meta-row">
                      <strong>Schedule:</strong> {club.schedule}
                    </div>
                    <div className="act-meta-row highlight">
                      <Trophy size={14} className="text-acc" />
                      <span>{club.achievements}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta">
          <div className="w">
            <h2>Experience student life at our Muradpur campus</h2>
            <Button href="/contact">Schedule a Campus Visit →</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

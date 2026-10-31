import TopStrip from '../../../components/TopStrip';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProgramsPage() {
  const programs = [
    {
      level: "01",
      title: "Primary School",
      grades: "Playgroup to Grade 5",
      description:
        "Building foundational confidence, curiosity, and literacy through activity-based learning and nurturing classroom environments.",
      highlights: [
        "Interactive reading and numeracy workshops",
        "Early science discovery and nature exploration",
        "Visual arts, music, and physical education",
        "Close parent-teacher collaborative updates"
      ]
    },
    {
      level: "02",
      title: "Middle School",
      grades: "Grade 6 to Grade 8",
      description:
        "Transitioning from concrete knowledge to critical thinking, independent inquiry, and structured academic disciplines.",
      highlights: [
        "Hands-on general science and computer laboratories",
        "Bilingual language mastery (Bangla & English)",
        "Inter-school debates, mental math, and quiz leagues",
        "Dedicated advisory and personal development periods"
      ]
    },
    {
      level: "03",
      title: "Secondary & Higher Secondary",
      grades: "Grade 9 to Grade 12",
      description:
        "Rigorous board exam preparation (SSC & HSC) paired with competitive entrance coaching and leadership opportunities.",
      highlights: [
        "Specialized Science and Business Studies streams",
        "Advanced physics, chemistry, biology, and IT labs",
        "Targeted mock tests, Olympiad coaching, and revision clinics",
        "University counseling and career pathway seminars"
      ]
    }
  ];

  return (
    <>
      <TopStrip />
      <Header />
      <main className="subpage-main">
        {/* Programs Hero */}
        <section className="subpage-hero">
          <div className="w">
            <span className="contact-pill">
              <Sparkles size={14} />
              ACADEMIC PATHWAYS
            </span>
            <h1 className="subpage-heading">
              Education tailored to <em>every milestone.</em>
            </h1>
            <p className="subpage-subtitle">
              From foundational primary discovery to competitive secondary achievements, our Muradpur
              campus provides clear academic roadmaps designed for student success.
            </p>
          </div>
        </section>

        {/* Programs List */}
        <section className="subpage-section">
          <div className="w">
            <div className="sh">
              <div>
                <span className="eb">CURRICULUM DIVISIONS</span>
                <h2>Comprehensive academic programs</h2>
              </div>
              <p>
                Our curriculum balances national academic standards with global pedagogy and practical
                problem solving.
              </p>
            </div>

            <div className="programs-grid">
              {programs.map((prog) => (
                <div key={prog.title} className="program-card">
                  <div className="prog-header">
                    <span className="prog-number">{prog.level}</span>
                    <span className="prog-grades-badge">{prog.grades}</span>
                  </div>
                  <h3 className="prog-title">{prog.title}</h3>
                  <p className="prog-desc">{prog.description}</p>

                  <div className="prog-highlights-box">
                    <h4>Program Highlights:</h4>
                    <ul>
                      {prog.highlights.map((h) => (
                        <li key={h}>
                          <CheckCircle2 size={16} className="text-acc" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a href="/contact" className="prog-action-btn">
                    <span>Enquire about {prog.title}</span>
                    <b>↗</b>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps to Join */}
        <section className="camp">
          <div className="w">
            <div className="sh">
              <div>
                <span className="eb">ENROLMENT</span>
                <h2>How to apply for your child</h2>
              </div>
              <p>Simple, transparent admissions supported by our Muradpur campus team.</p>
            </div>

            <div className="st">
              <div>
                <b>01</b>
                <h3>Submit an enquiry</h3>
                <p>Fill out our simple contact form or call our admissions desk directly.</p>
              </div>
              <div>
                <b>02</b>
                <h3>Campus visit & chat</h3>
                <p>Visit Muradpur, walk through our labs and classrooms, and meet teachers.</p>
              </div>
              <div>
                <b>03</b>
                <h3>Enrolment confirmation</h3>
                <p>Complete paperwork and welcome your child to the Sunrise family.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta">
          <div className="w">
            <h2>Find the right grade and program for your child</h2>
            <Button href="/contact">Book an Admissions Meeting →</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

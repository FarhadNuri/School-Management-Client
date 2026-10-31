import TopStrip from '../../../components/TopStrip';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <TopStrip />
      <Header />
      <main className="subpage-main">
        {/* Subpage Hero */}
        <section className="subpage-hero">
          <div className="w">
            <span className="contact-pill">
              <Sparkles size={14} />
              ABOUT SUNRISE
            </span>
            <h1 className="subpage-heading">
              Rooted in curiosity, <em>built for life.</em>
            </h1>
            <p className="subpage-subtitle">
              Located in Muradpur, Chattogram, Sunrise Model School combines rigorous academics,
              holistic character development, and personal mentorship to shape tomorrow’s leaders.
            </p>
          </div>
        </section>

        {/* Pillars / Bento */}
        <section className="subpage-section">
          <div className="w">
            <div className="sh">
              <div>
                <span className="eb">OUR ETHOS</span>
                <h2>What defines an education at Sunrise</h2>
              </div>
              <p>
                From foundational primary learning to advanced secondary studies, every student is
                guided to find their voice and strive for mastery.
              </p>
            </div>

            <div className="bento">
              <div className="big has-bg">
                <img
                  src="/trophies.jpg"
                  alt="Academic Excellence and Championship Trophies"
                  className="bento-bg"
                  loading="lazy"
                />
                <span className="tg">ESTABLISHED VISION</span>
                <b>20+</b>
                <h3>Years of Educational Excellence</h3>
                <p>
                  Two decades of academic milestones, board toppers, and university placements across
                  Bangladesh and internationally.
                </p>
              </div>

              <div>
                <span className="tg">ACADEMIC RIGOR</span>
                <h3>National & STEM Focus</h3>
                <p>Modern science laboratories, robotics, and strong language arts.</p>
              </div>

              <div className="cr">
                <span className="tg">VALUES</span>
                <h3>Character First</h3>
                <p>Ethics, community service, and mutual respect woven into daily school life.</p>
              </div>

              <div className="wide co">
                <span className="tg">STUDENT-CENTRIC</span>
                <h3>Small Classes, Big Impact</h3>
                <p>
                  With low student-to-teacher ratios, no child goes unnoticed. Teachers identify strengths
                  early and guide each individual forward.
                </p>
              </div>

              <div className="wide">
                <span className="tg">CAMPUS LOCATION</span>
                <h3>Muradpur, Chattogram</h3>
                <p>
                  A purpose-built learning environment right in the heart of Chattogram, equipped with
                  multimedia classrooms, libraries, and creative zones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Quote Banner */}
        <section className="cm">
          <div className="w">
            <div>
              <span className="eb">OUR PHILOSOPHY</span>
              <blockquote>
                “We don’t just prepare children for exams. We nurture resilient thinkers who care
                deeply about making a positive difference in society.”
              </blockquote>
              <p>— Principal & Academic Board, Sunrise Model School</p>
            </div>
            <div className="pp">
              <div className="p1">
                <img
                  src="/kids1.png"
                  alt="Primary school student with backpack"
                  className="pp-img pp-kids1"
                  loading="lazy"
                />
              </div>
              <div className="p2">
                <img
                  src="/kids2.png"
                  alt="Student holding books"
                  className="pp-img pp-kids2"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta">
          <div className="w">
            <h2>Ready to see our community in action?</h2>
            <Button href="/contact">Connect with Admissions →</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

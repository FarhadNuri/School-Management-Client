import TopStrip from '../../../components/TopStrip';
import Header from '../../../components/Header';
import ContactSection from '../../../components/ContactSection';
import Footer from '../../../components/Footer';

export default function ContactPage() {
  return (
    <>
      <TopStrip />
      <Header />
      <main className="subpage-main">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}


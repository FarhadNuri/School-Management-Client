import { useState } from 'react';
import {
  GraduationCap,
  Building2,
  CreditCard,
  MessageCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  Send,
  CheckCircle2
} from 'lucide-react';
import { contactContent } from '../data/contactContent';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: contactContent.formSection.subjects[0],
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const getChannelIcon = (iconName) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap size={22} />;
      case 'Building2':
        return <Building2 size={22} />;
      case 'CreditCard':
        return <CreditCard size={22} />;
      case 'MessageCircle':
        return <MessageCircle size={22} />;
      default:
        return <Sparkles size={22} />;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? -1 : index));
  };

  return (
    <>
      {/* Contact Hero with Light Effect & Bottom Border */}
      <section className="subpage-hero">
        <div className="w">
          <span className="contact-pill">
            <Sparkles size={14} />
            {contactContent.hero.badge}
          </span>
          <h1 className="subpage-heading">
            Contact <em>Us</em>
          </h1>
          <p className="subpage-subtitle">{contactContent.hero.description}</p>
        </div>
      </section>

      <section className="contact-section" id="contact" style={{ paddingTop: '72px' }}>
        <div className="w">
          {/* 1. Direct Channels / "Talk to the right people" */}
          <div className="contact-block">
          <div className="contact-block-header text-center">
            <span className="eb-pill">
              <Sparkles size={13} />
              {contactContent.channels.badge}
            </span>
            <h3 className="contact-section-title">{contactContent.channels.title}</h3>
            <p className="contact-section-desc">{contactContent.channels.description}</p>
          </div>

          <div className="channels-grid">
            {contactContent.channels.items.map((item) => (
              <div key={item.id} className="channel-card">
                <div className="channel-icon-box">{getChannelIcon(item.icon)}</div>
                <h4 className="channel-title">{item.title}</h4>
                <p className="channel-desc">{item.description}</p>

                <div className="channel-meta">
                  {item.email && (
                    <div className="meta-row">
                      <Mail size={14} className="meta-icon" />
                      <span>{item.email}</span>
                    </div>
                  )}
                  {item.phone && (
                    <div className="meta-row">
                      <Phone size={14} className="meta-icon" />
                      <span>{item.phone}</span>
                    </div>
                  )}
                  {item.subtext && (
                    <div className="meta-row subtle">
                      <span>{item.subtext}</span>
                    </div>
                  )}
                </div>

                <a
                  href={item.actionLink}
                  target={item.actionLink.startsWith('http') ? '_blank' : undefined}
                  rel={item.actionLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="channel-btn"
                >
                  <span>{item.actionText}</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Contact Form & Office Hours / Campus Visit Card */}
        <div className="contact-block" id="contact-form">
          <div className="contact-block-header text-center">
            <span className="eb-pill">
              <Sparkles size={13} />
              {contactContent.formSection.badge}
            </span>
            <h3 className="contact-section-title">{contactContent.formSection.title}</h3>
            <p className="contact-section-desc">{contactContent.formSection.description}</p>
          </div>

          <div className="form-layout-grid">
            {/* Form Column */}
            <div className="form-card">
              {submitted ? (
                <div className="form-success-box">
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3>Message sent successfully!</h3>
                  <p>
                    Thank you, <strong>{formData.name}</strong>. Our Muradpur campus team has
                    received your message regarding <em>{formData.subject}</em> and will reach out to you at{' '}
                    <strong>{formData.email}</strong> within 24 hours.
                  </p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: contactContent.formSection.subjects[0],
                        message: ''
                      });
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form-inner">
                  <div className="form-fields-grid">
                    <div className="input-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+880 1819-000000"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="input-group">
                      <label htmlFor="subject">What is this about?</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        {contactContent.formSection.subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-message-btn">
                    <span>Send Message</span>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Right Side Cards */}
            <div className="side-cards-col">
              {/* Office Hours */}
              <div className="info-card office-hours-card">
                <div className="card-top-header">
                  <div className="info-icon-badge">
                    <Clock size={20} />
                  </div>
                  <h4>{contactContent.formSection.officeHours.title}</h4>
                </div>

                <div className="hours-table">
                  {contactContent.formSection.officeHours.schedule.map((item) => (
                    <div key={item.days} className="hours-row">
                      <span className="days-label">{item.days}</span>
                      <span className="time-val">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prefer to see it in person card */}
              <div className="info-card tour-callout-card">
                <div className="card-top-header">
                  <div className="info-icon-badge accent-badge">
                    <Calendar size={20} />
                  </div>
                  <h4>{contactContent.formSection.visitCard.title}</h4>
                </div>
                <p className="tour-card-desc">
                  {contactContent.formSection.visitCard.description}
                </p>

                <div className="tour-contacts">
                  <a href={`tel:${contactContent.formSection.visitCard.phone}`} className="tour-contact-item">
                    <Phone size={15} />
                    <span>{contactContent.formSection.visitCard.phone}</span>
                  </a>
                  <a href={`mailto:${contactContent.formSection.visitCard.email}`} className="tour-contact-item">
                    <Mail size={15} />
                    <span>{contactContent.formSection.visitCard.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Campus Map / "Find Us" in Muradpur, Chattogram */}
        <div className="contact-block">
          <div className="contact-block-header text-center">
            <span className="eb-pill">
              <Sparkles size={13} />
              {contactContent.campusMap.badge}
            </span>
            <h3 className="contact-section-title">{contactContent.campusMap.title}</h3>
            <p className="contact-section-desc">{contactContent.campusMap.description}</p>
          </div>

          <div className="single-campus-card">
            <div className="campus-meta-pane">
              <div>
                <span className="campus-tag-pill">
                  <MapPin size={13} />
                  {contactContent.campusMap.campus.tag}
                </span>
                <h4 className="campus-name">{contactContent.campusMap.campus.name}</h4>
                <p className="campus-address">{contactContent.campusMap.campus.address}</p>
                <p className="campus-landmark">{contactContent.campusMap.campus.landmark}</p>
              </div>

              <div className="campus-details-list">
                <div className="detail-item">
                  <Phone size={16} />
                  <a href={`tel:${contactContent.campusMap.campus.phone}`}>
                    {contactContent.campusMap.campus.phone}
                  </a>
                </div>
                <div className="detail-item">
                  <Mail size={16} />
                  <a href={`mailto:${contactContent.campusMap.campus.email}`}>
                    {contactContent.campusMap.campus.email}
                  </a>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>Sunday – Thursday, 7:30 AM – 4:30 PM</span>
                </div>
              </div>

              <a
                href={contactContent.campusMap.campus.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-btn"
              >
                <span>Get directions on Google Maps</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="campus-map-embed">
              <iframe
                title="Muradpur Chattogram Campus Map"
                src={contactContent.campusMap.campus.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* 4. Frequently Asked Questions / "Questions we hear every week" */}
        <div className="contact-block">
          <div className="contact-block-header text-center">
            <span className="eb-pill">
              <Sparkles size={13} />
              {contactContent.faqs.badge}
            </span>
            <h3 className="contact-section-title">{contactContent.faqs.title}</h3>
            <p className="contact-section-desc">{contactContent.faqs.description}</p>
          </div>

          <div className="faqs-accordion">
            {contactContent.faqs.items.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question} className={`faq-card ${isOpen ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`faq-arrow ${isOpen ? 'rotated' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Pre-footer Conversation Banner / "The next step is a conversation" */}
        <div className="conversation-cta-box">
          <span className="eb-pill center-pill">
            <Sparkles size={13} />
            {contactContent.nextStepBanner.badge}
          </span>
          <h3 className="conversation-heading">{contactContent.nextStepBanner.title}</h3>
          <p className="conversation-desc">{contactContent.nextStepBanner.description}</p>
          <div className="conversation-actions">
            <a href={contactContent.nextStepBanner.secondaryCta.href} className="btn cta-primary">
              {contactContent.nextStepBanner.secondaryCta.text}
            </a>
            <a href="tel:+8801819012345" className="btn cta-secondary">
              Call Muradpur office: +880 1865-779218
            </a>
          </div>
        </div>
      </div>
    </section>
  </>
  );
}


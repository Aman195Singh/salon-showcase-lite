import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineHeart,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { getPublishedContent } from "@/lib/content";
import styles from "./about.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us",
  description:
    "Learn about our salon's story, our team, and our commitment to excellence in grooming and beauty services.",
};

const VALUES = [
  {
    icon: <HiOutlineSparkles size={24} />,
    title: "Quality First",
    description:
      "We never compromise on the quality of products or the skill of our services.",
  },
  {
    icon: <HiOutlineHeart size={24} />,
    title: "Client Care",
    description:
      "Every client receives personalised attention and leaves feeling valued.",
  },
  {
    icon: <HiOutlineShieldCheck size={24} />,
    title: "Hygiene & Safety",
    description:
      "Sterilised tools, clean spaces, and strict hygiene protocols at all times.",
  },
  {
    icon: <HiOutlineUserGroup size={24} />,
    title: "Inclusive Space",
    description:
      "A welcoming environment for everyone, regardless of age or gender.",
  },
];

const MILESTONES = [
  {
    year: "2020",
    text: "Salon founded with a vision to provide premium grooming for all.",
  },
  {
    year: "2022",
    text: "Expanded services to include bridal makeup and advanced skin treatments.",
  },
  {
    year: "2024",
    text: "Grew to a full team of certified expert stylists and skin specialists.",
  },
  {
    year: "Present",
    text: "Continuing to serve and delight clients with top-rated beauty and grooming.",
  },
];

export default async function AboutPage() {
  const content = await getPublishedContent();
  const about = content.about || {};
  const paragraphs = about.storyParagraphs || [
    "We started with a simple belief: everyone deserves access to quality grooming and beauty services in a clean, comfortable, and welcoming environment.",
    "Our team of skilled professionals brings years of experience across hair styling, skin care, makeup artistry, and grooming — serving both men and women with equal dedication.",
    "From a classic haircut to a complete bridal makeover, we treat every service as an opportunity to make someone feel confident and beautiful.",
  ];

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className="section-label">About Us</span>
          <h1 className={styles.heroTitle}>{about.title || "Our Story"}</h1>
          <p className={styles.heroDesc}>
            {about.description ||
              "A passion for beauty, a commitment to excellence, and years of experience — that's what defines us."}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section">
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImage}>
              <img
                src="/images/about-salon.jpg"
                alt="Aura Luxe Salon Professional Styling"
                className={styles.storyImg}
              />
            </div>
            <div className={styles.storyContent}>
              <span className="section-label">Who We Are</span>
              <h2 className="section-title">More Than Just a Salon</h2>
              {paragraphs.map((para, i) => (
                <p key={i} className={styles.storyText}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What We Stand For</h2>
          </div>

          <div className={styles.valuesGrid}>
            {VALUES.map((v, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey / Timeline */}
      <section className="section">
        <div className="container">
          <div className="section-header-center">
            <span className="section-label">Our Journey</span>
            <h2 className="section-title">Milestones</h2>
          </div>

          <div className={styles.timeline}>
            {MILESTONES.map((m, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineYear}>{m.year}</span>
                  <p className={styles.timelineText}>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Connect</h4>
            <p>
              <a
                href="https://svish001.github.io/portfolio/"
                target="_blank"
                rel="noreferrer"
                data-cursor="disable"
              >
                Portfolio — svish001.github.io/portfolio
              </a>
            </p>
            <h4>Education</h4>
            <p>
              Bachelor in Computer Science, SUNY Plattsburgh — 2022–2025
            </p>
            <p>GPA: 3.78</p>
            <p>
              Greater Burlington Area, Vermont
            </p>
          </div>
          <div className="contact-box">
            <h4>Profiles</h4>
            <a
              href="https://github.com/svish001"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              GitHub <MdArrowOutward />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              LinkedIn <MdArrowOutward />
            </a>
            <a
              href="https://svish001.github.io/portfolio/"
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Portfolio <MdArrowOutward />
            </a>
            <h4>Certifications</h4>
            <p>Microsoft Power BI Data Analyst (2025)</p>
            <p>IBM Full Stack Software Developer (2025)</p>
            <p>Google IT Support (2025)</p>
            <p>Oracle Cloud Infrastructure Foundations (2024)</p>
            <h4>Languages</h4>
            <p>English, Gujarati, Hindi, Spanish</p>
          </div>
          <div className="contact-box">
            <h2>
              Built and maintained by <br /> <span>Sumeet Vishwakarma</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

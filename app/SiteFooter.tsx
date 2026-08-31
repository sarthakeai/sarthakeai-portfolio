import { Briefcase } from "@phosphor-icons/react/dist/ssr/Briefcase";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
import { XLogo } from "@phosphor-icons/react/dist/ssr/XLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
import { socials } from "./portfolio-data";

const footerLinks = [
  { href: "/work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "What I do" },
  { href: "/#youtube", label: "YouTube" },
  { href: "/#contact", label: "Contact" },
];

const footerSocials = [
  ...socials,
  { platform: "upwork", label: "Upwork", href: "https://www.upwork.com/freelancers/~01a047caaf8c8ed5b6" },
  { platform: "email", label: "Email", href: "mailto:work@sarthakeai.com" },
];

const footerSocialIcons = {
  instagram: InstagramLogo,
  x: XLogo,
  youtube: YoutubeLogo,
  upwork: Briefcase,
  email: EnvelopeSimple,
};

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-upper">
          <div className="footer-directory">
            <nav className="footer-column" aria-label="Footer navigation">
              <p className="footer-label">Navigation</p>
              <div className="footer-link-list">
                {footerLinks.map((link) => (
                  <a className={`footer-directory-link${link.href === "/#contact" ? " footer-link-contact" : ""}`} key={link.href} href={link.href}>
                    <span className="footer-link-title">{link.label}</span>
                    <span className="footer-link-arrow" aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </nav>
            <div className="footer-column" aria-label="Social profiles">
              <p className="footer-label">Elsewhere</p>
              <div className="footer-link-list">
                {footerSocials.map((social) => {
                  const SocialIcon = footerSocialIcons[social.platform as keyof typeof footerSocialIcons];
                  const isEmail = social.platform === "email";
                  return (
                    <a className="footer-directory-link footer-social-link" data-platform={social.platform} key={social.label} href={social.href} target={isEmail ? undefined : "_blank"} rel={isEmail ? undefined : "noopener noreferrer"} aria-label={isEmail ? "Email Sarthak at work@sarthakeai.com" : `${social.label}, opens in a new tab`}>
                      <SocialIcon className="footer-link-icon" aria-hidden="true" weight="regular" />
                      <span className="footer-link-title">{social.platform === "x" ? "X / Twitter" : social.label}</span>
                      <span className="footer-link-arrow" aria-hidden="true">↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <a className="footer-back-to-top" href="#top" aria-label="Back to top">↑</a>
        </div>
        <div className="footer-divider" aria-hidden="true" />
        <div className="footer-bottom">
          <p className="footer-quote">TRUST THE PROCESS.</p>
          <p className="footer-copyright"><span>© 2026 Sarthak Sharma</span><span>All Rights Reserved.</span></p>
        </div>
      </div>
    </footer>
  );
}

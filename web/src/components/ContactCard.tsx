import { Mail, Github, Linkedin, Globe } from "lucide-react";
import type { Contact } from "../types";

interface ContactCardProps {
  data: Contact;
}

export function ContactCard({ data }: ContactCardProps) {
  const contactLinks = [
    {
      icon: Mail,
      label: "Email",
      value: data.email,
      href: `mailto:${data.email}`,
    },
    {
      icon: Github,
      label: "GitHub",
      value: data.github.replace("https://github.com/", "@"),
      href: data.github,
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      value: data.linkedin.replace("https://linkedin.com/in/", ""),
      href: data.linkedin,
    },
    {
      icon: Globe,
      label: "Portfolio",
      value: data.portfolio.replace("https://", ""),
      href: data.portfolio,
    },
  ];

  return (
    <div className="rounded-xl border border-default bg-surface p-5 shadow-sm animate-fade-in">
      <h2 className="heading-md mb-4">Get in Touch</h2>

      <div className="space-y-2.5">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-default hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-white flex items-center justify-center text-tertiary group-hover:text-blue-600 transition-colors">
              <link.icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-2xs font-semibold text-tertiary uppercase tracking-wider">
                {link.label}
              </p>
              <p className="text-sm truncate">{link.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

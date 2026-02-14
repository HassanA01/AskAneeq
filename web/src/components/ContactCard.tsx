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
    <div className="card animate-fade-in">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Get in Touch</h2>

      <div className="space-y-2.5">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-white flex items-center justify-center text-gray-400 group-hover:text-sky-600 transition-colors">
              <link.icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {link.label}
              </p>
              <p className="text-sm text-gray-800 truncate">{link.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

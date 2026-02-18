import { Globe, Briefcase } from "lucide-react";
import { Avatar } from "@openai/apps-sdk-ui/components/Avatar";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { profileImage } from "../assets/profile-image";
import type { Overview } from "../types";

interface ProfileCardProps {
  data: Overview;
}

export function ProfileCard({ data }: ProfileCardProps) {
  return (
    <div className="rounded-xl border border-default bg-surface p-5 shadow-sm animate-fade-in">
      <div className="flex items-start gap-4">
        <Avatar
          imageUrl={profileImage}
          name={data.name}
          size={56}
          color="primary"
        />

        <div className="flex-1 min-w-0">
          <h2 className="heading-md">{data.name}</h2>
          <p className="text-sm font-semibold text-blue-600">{data.title}</p>
          <p className="text-sm text-secondary mt-1.5 leading-relaxed">
            {data.tagline}
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-tertiary" />
          <span className="text-sm text-secondary">
            {data.yearsExperience}+ years experience
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-tertiary" />
          <span className="text-sm text-secondary">
            {data.languages.length} languages
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-default">
        <p className="text-xs font-semibold text-tertiary uppercase tracking-wider mb-2">
          Spoken Languages
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.languages.map((lang) => (
            <Badge key={lang} color="secondary" size="sm">
              {lang}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

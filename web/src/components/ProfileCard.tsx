import { User, Globe, Briefcase } from "lucide-react";
import type { Overview } from "../types";

interface ProfileCardProps {
  data: Overview;
}

export function ProfileCard({ data }: ProfileCardProps) {
  return (
    <div className="card animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
          <p className="text-sky-600 font-semibold">{data.title}</p>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {data.tagline}
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {data.yearsExperience}+ years experience
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {data.languages.length} languages
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Spoken Languages
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.languages.map((lang) => (
            <span key={lang} className="badge badge-secondary">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

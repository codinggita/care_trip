import { useState } from 'react';

export default function Avatar({ doc, className = "" }) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = doc.icon || (doc.images && doc.images[0]);

  return (
    <div className={`rounded-xl ${doc.color || 'bg-primary-700'} text-white flex items-center justify-center font-semibold shadow-md overflow-hidden ${className}`}>
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={doc.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="animate-fade-in">{doc.initials || 'DR'}</span>
      )}
    </div>
  );
}

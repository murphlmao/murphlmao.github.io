import Link from 'next/link';
import Image from 'next/image';

// Render icon - supports emojis, image paths, or nothing
function Icon({ icon, size = 16, className = "" }) {
  if (!icon) return null;

  // If it starts with /, it's an image path
  if (icon.startsWith('/')) {
    return (
      <Image
        src={icon}
        alt=""
        width={size}
        height={size}
        className={`inline-block ${className}`}
      />
    );
  }

  // Otherwise treat as emoji/text
  return <span className={className}>{icon}</span>;
}

export default function CategoryNav({ headers = [], postCounts = {} }) {
  return (
    <nav className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Browse by Category
      </h2>

      {headers.map((header) => (
        <div key={header.slug} className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Icon icon={header.icon} size={14} />
            {header.name}
          </h3>
          <ul className="space-y-2">
            {header.categories.map((category) => {
              const count = postCounts[category.slug] || 0;
              return (
                <li key={category.slug}>
                  <Link
                    href={`/articles/${category.slug}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                  >
                    <span className="flex items-center gap-1.5 group-hover:text-sky-500 dark:group-hover:text-sky-400">
                      <Icon icon={category.icon} size={14} />
                      {category.name}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

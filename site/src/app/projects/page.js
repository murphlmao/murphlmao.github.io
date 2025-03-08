import { projects, techStack } from '../../../content/projects/data';

export default function ProjectsPage() {
  return (
    <div className="mt-16 sm:mt-18">
      <div className="mx-auto max-w-7xl">
        <div className="relative px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl lg:max-w-5xl">
            <header className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
                Things I&apos;ve made trying to put my dent in the universe.
              </h1>
              <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
                I&apos;ve worked on tons of little projects over the years but these
                are the ones that I&apos;m most proud of. Many of them are
                open-source, so if you see something that piques your interest,
                check out the code and contribute if you have ideas for how it
                can be improved.
              </p>
            </header>

            {/* Technical Arsenal Section */}
            <div className="mt-16 sm:mt-20 rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Technical Arsenal
              </h2>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7">
                {Object.entries(techStack).map(([category, items], index) => (
                  <div
                    key={category}
                    className={`${index === 3 ? "mb-6 md:mb-0" : ""}`}
                  >
                    <h3 className="text-sm font-medium text-sky-500 dark:text-sky-400">
                      {category}
                    </h3>
                    <p className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {items.map((item, index) => (
                        <span key={index}>
                          {item}
                          {index < items.length - 1 && ", "}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
                This toolkit empowers me to design and develop solutions from
                prototype to production, ensuring{" "}
                <span className="text-sky-500 dark:text-sky-400">
                  scalability
                </span>{" "}
                and{" "}
                <span className="text-sky-500 dark:text-sky-400">
                  maintainability
                </span>{" "}
                at every stage.
              </p>
            </div>

            {/* Projects Section */}
            <div className="mt-16 sm:mt-20">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  project.link ? (
                    <a
                      key={index}
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex flex-col items-start rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition h-full"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                            {project.title}
                          </h2>
                          {project.status && (
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'Live'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                              }`}
                            >
                              {project.status}
                            </span>
                          )}
                        </div>
                        <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {project.description}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {project.tech.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="relative z-10 mt-6 flex items-center text-sm font-medium text-zinc-400 transition group-hover:text-sky-500 dark:text-zinc-200">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-6 w-6 flex-none"
                        >
                          <path
                            d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="ml-2">View project</span>
                      </div>
                      <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-sky-500/0 via-sky-500/40 to-sky-500/0 dark:from-sky-400/0 dark:via-sky-400/40 dark:to-sky-400/0"></span>
                      <span className="absolute inset-y-1 left-0 w-px bg-gradient-to-b from-sky-500/0 via-sky-500/40 to-sky-500/0 dark:from-sky-400/0 dark:via-sky-400/40 dark:to-sky-400/0"></span>
                    </a>
                  ) : (
                    <div
                      key={index}
                      className="relative flex flex-col items-start rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 h-full"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                            {project.title}
                          </h2>
                          {project.status && (
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'Live' || project.status === 'Coming Soon'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                              }`}
                            >
                              {project.status}
                            </span>
                          )}
                        </div>
                        <p className="relative z-10 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {project.description}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {project.tech.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-sky-500/0 via-sky-500/40 to-sky-500/0 dark:from-sky-400/0 dark:via-sky-400/40 dark:to-sky-400/0"></span>
                      <span className="absolute inset-y-1 left-0 w-px bg-gradient-to-b from-sky-500/0 via-sky-500/40 to-sky-500/0 dark:from-sky-400/0 dark:via-sky-400/40 dark:to-sky-400/0"></span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

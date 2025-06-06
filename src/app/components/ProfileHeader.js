import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function ProfileHeader() {
  return (
    <div className=" mx-auto lg:max-w-5xl flex flex-col md:flex-row justify-between items-start md:space-x-14 w-full mb-10">
      <div className="flex md:w-3/4 flex-col mt-6">
        <h1 className="font-bold text-3xl md:text-5xl tracking-tight mb-2 text-black dark:text-white">
          Murphy Malcolm
        </h1>
        <div className="text-zinc-600 dark:text-zinc-400 mb-4">
          <p>
            My heart lies with Full-Stack Development, Linux (I use Arch btw), DevOps, Networking,
            Cybersecurity, & going long walks on the beach so we can talk about our feelings.
          </p>
          <br/>
          <p>
            I&apos;ve a lot of strong opinions (all of which are right), but it always comes from a place of love, passion, and desire
            to continuously learn. Feel free to reach out anytime on LinkedIn.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-4">
          <a
            href="https://github.com/murphlmao"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <FaGithub className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/murphymalcolm/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="relative flex-shrink-1 p-4 md:p-4 md:order-last order-first">
        <div
          className="block z-[5] overflow-hidden rounded-sm shadow-xl ring-1 ring-slate-900/5 relative bg-white h-40 w-40"
        >
          <div className="relative w-full h-full">
            <Image
              src="/profile.jpeg"
              alt="Profile photo"
              fill
              className="transition duration-500 blur-0 scale-100 bg-gray-100 object-cover"
              sizes="(max-width: 768px) 100vw, 80px"
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="z-0">
          <div className="absolute left-0 -right-12 top-0 h-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] [mask-image:linear-gradient(to_right,transparent,white_4rem,white_calc(100%-4rem),transparent)]"></div>
          <div className="absolute -top-8 bottom-0 left-12 w-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] [mask-image:linear-gradient(to_top,transparent,white_4rem,white_calc(100%-4rem),transparent)]"></div>
          <div className="absolute left-0 -right-12 bottom-14 h-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] [mask-image:linear-gradient(to_right,transparent,white_4rem,white_calc(100%-4rem),transparent)]"></div>
          <div className="absolute right-0 -top-2 -bottom-8 w-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] [mask-image:linear-gradient(to_top,transparent,white_4rem,white_calc(100%-4rem),transparent)]"></div>
          <div className="absolute bottom-full right-10 -mb-px flex h-8 items-end overflow-hidden">
            <div className="flex -mb-px h-[2px] w-40 -scale-x-100">
              <div className="w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
              <div className="-ml-[100%] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, type ReactNode } from 'react';
import css from './Quiz.module.css';

/* A one-question true-or-false quiz in the article's figure frame. A wrong pick says so
   and leaves both buttons live, so the reader has another go; the right pick shows the
   why, which is whatever the article puts inside the tag. Any article can carry one:

     <Quiz question="Stacks and queues are sequence containers." answer={false} client:visible>
       They're container adapters: ...
     </Quiz>
*/

interface Props {
  question: string; // a statement to judge, so it reads naturally against true / false
  answer: boolean;
  children?: ReactNode; // why the answer is what it is; shown once the reader has it
}

const CHOICES = [true, false] as const;

export default function Quiz({ question, answer, children }: Props) {
  const [picked, setPicked] = useState<boolean | null>(null); // the reader's latest pick
  const [tries, setTries] = useState(0); // keys the verdict word, so a repeated wrong pick shakes again
  const solved = picked === answer;

  const pick = (choice: boolean) => {
    setPicked(choice);
    setTries((n) => n + 1);
  };
  const reset = () => {
    setPicked(null);
    setTries(0);
  };

  return (
    <figure className={`fig ${css.root}`} data-quiz aria-label="true or false">
      <div className={`fig-head ${css.head}`}>
        <span>true or false</span>
        <button type="button" className={css.again} onClick={reset}>
          again
        </button>
      </div>
      <div className={`fig-body ${css.body}`}>
        <p className={css.question}>{question}</p>
        <div className={css.choices}>
          {CHOICES.map((choice) => (
            <button
              key={String(choice)}
              type="button"
              className={css.choice}
              disabled={solved}
              data-verdict={picked === choice ? (choice === answer ? 'right' : 'wrong') : undefined}
              onClick={() => pick(choice)}
            >
              {String(choice)}
            </button>
          ))}
        </div>
        {/* the live region stays mounted (a screen reader only announces changes inside an
            existing one); the word inside is remounted per try so its animation replays */}
        <div className={css.verdict} role="status">
          {picked !== null &&
            (solved ? (
              <>
                <span key={tries} className={css.yep}>yep.</span> {children}
              </>
            ) : (
              <span key={tries} className={css.nope}>nope.</span>
            ))}
        </div>
      </div>
    </figure>
  );
}

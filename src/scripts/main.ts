import { initTweaks } from './tweaks';
import { initOrb } from './orb';
import { initPen } from './pen';
import { initMenu } from './menu';
import { initCopy, initToc } from './article';
import { initArticles } from './articles';

initTweaks();
initMenu();
initOrb();
initPen();
initCopy();
initToc();
initArticles();
// later tasks append: initScene, initSidecat, initCritters, initWalker

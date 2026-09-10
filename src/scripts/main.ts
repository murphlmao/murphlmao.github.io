import { initTweaks } from './tweaks';
import { initOrb } from './orb';
import { initMenu } from './menu';
import { initCopy, initToc } from './article';
import { initArticles } from './articles';

initTweaks();
initMenu();
initOrb();
initCopy();
initToc();
initArticles();
// later tasks append: initScene, initPen, initSidecat, initCritters, initWalker

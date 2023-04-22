// show customised outline when an element has focus (but only if the user is
// using the keyboard)
// TODO: move this to a global css rule
export const FOCUS_VISIBLE_OUTLINE = `focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70`;

export const LINK_STYLES = `text-primary-700/90 dark:text-primary-400/90 underline decoration-primary-800/30 underline-offset-2 transition-all hover:text-primary-700 dark:hover:text-primary-400 hover:decoration-primary-800/50 dark:hover:decoration-primary-600/50`;

export const LINK_SUBTLE_STYLES = `hover:underline hover:decoration-primary-700/30 hover:underline-offset-2 hover:text-primary-600/90`;

export const HEADING_LINK_ANCHOR = `before:content-['•'] before:mr-1 before:text-primary-900 hover:before:text-primary-900/50 dark:before:text-primary-600 dark:hover:before:text-primary-600/50`;
